<?php

use App\Exceptions\ShopifyProductCreatorException;
use App\Lib\AuthRedirection;
use App\Lib\DetaxeApiClient;
use App\Lib\EnsureBilling;
use App\Lib\ProductCreator;
use App\Lib\SFTPClient;
use App\Lib\Utils as AppUtils;
use Illuminate\Support\Facades\Session;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Shopify\Auth\OAuth;
use Shopify\Auth\Session as AuthSession;
use Shopify\Clients\HttpHeaders;
use Shopify\Clients\Rest;
use Shopify\Context;
use Shopify\Exception\InvalidWebhookException;
use Shopify\Utils;
use Shopify\Webhooks\Registry;
use Shopify\Webhooks\Topics;
use Intervention\Image\Facades\Image;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
| If you are adding routes outside of the /api path, remember to also add a
| proxy rule for them in web/frontend/vite.config.js
|
*/

Route::fallback(function (Request $request) {
    if (Context::$IS_EMBEDDED_APP &&  $request->query("embedded", false) === "1") {
        if (env('APP_ENV') === 'production') {
            return file_get_contents(public_path('index.html'));
        } else {
            return file_get_contents(base_path('frontend/index.html'));
        }
    } else {
        return redirect(Utils::getEmbeddedAppUrl($request->query("host", null)) . "/" . $request->path());
    }
})->middleware('shopify.installed');

Route::get('/api/auth', function (Request $request) {
    $shop = Utils::sanitizeShopDomain($request->query('shop'));

    // Delete any previously created OAuth sessions that were not completed (don't have an access token)
    Session::where('shop', $shop)->where('access_token', null)->delete();

    return AuthRedirection::redirect($request);
});

Route::get('/api/auth/callback', function (Request $request) {
    $session = OAuth::callback(
        $request->cookie(),
        $request->query(),
        ['App\Lib\CookieHandler', 'saveShopifyCookie'],
    );

    $host = $request->query('host');
    $shop = Utils::sanitizeShopDomain($request->query('shop'));

    $response = Registry::register('/api/webhooks', Topics::APP_UNINSTALLED, $shop, $session->getAccessToken());
    if ($response->isSuccess()) {
        Log::debug("Registered APP_UNINSTALLED webhook for shop $shop");
    } else {
        Log::error(
            "Failed to register APP_UNINSTALLED webhook for shop $shop with response body: " .
                print_r($response->getBody(), true)
        );
    }

    $redirectUrl = Utils::getEmbeddedAppUrl($host);
    if (Config::get('shopify.billing.required')) {
        list($hasPayment, $confirmationUrl) = EnsureBilling::check($session, Config::get('shopify.billing'));

        if (!$hasPayment) {
            $redirectUrl = $confirmationUrl;
        }
    }

    return redirect($redirectUrl);
});


// Webhooks
Route::post('/api/webhooks', function (Request $request) {
    try {
        $topic = $request->header(HttpHeaders::X_SHOPIFY_TOPIC, '');

        $response = Registry::process($request->header(), $request->getContent());
        if (!$response->isSuccess()) {
            Log::error("Failed to process '$topic' webhook: {$response->getErrorMessage()}");
            return response()->json(['message' => "Failed to process '$topic' webhook"], 500);
        }
    } catch (InvalidWebhookException $e) {
        Log::error("Got invalid webhook request for topic '$topic': {$e->getMessage()}");
        return response()->json(['message' => "Got invalid webhook request for topic '$topic'"], 401);
    } catch (\Exception $e) {
        Log::error("Got an exception when handling '$topic' webhook: {$e->getMessage()}");
        return response()->json(['message' => "Got an exception when handling '$topic' webhook"], 500);
    }
});


// Custom added
Route::get('/api/locations', function (Request $request) {
    /** @var AuthSession */
    $session = $request->get('shopifySession');

    $client = new Rest($session->getShop(), $session->getAccessToken());
    $result = $client->get('locations');

    return response($result->getDecodedBody());
})->middleware('shopify.auth');

Route::get('/api/orders', function (Request $request) {
    /** @var AuthSession */
    $session = $request->get('shopifySession');

    $client = new Rest($session->getShop(), $session->getAccessToken());
    $result = $client->get('orders', query: ["status" => "any", "financial_status" => "paid"]);

    return response($result->getDecodedBody());
})->middleware('shopify.auth');

Route::get('/api/orders/{id}', function (Request $request, $id) {
    /** @var AuthSession */
    $session = $request->get('shopifySession');

    $client = new Rest($session->getShop(), $session->getAccessToken());
    $result = $client->get("orders/$id");

    return response($result->getDecodedBody());
})->middleware('shopify.auth');

Route::get('/api/pos-orders', function (Request $request) {
    /** @var AuthSession */
    $session = $request->get('shopifySession');

    $zip_code = $request->input('zipCode');

    $client = new Rest($session->getShop(), $session->getAccessToken());
    $orders = $client->get('orders', query: ['status' => 'any', "financial_status" => "paid"])->getDecodedBody()["orders"];

    $posOrders = array_filter($orders, function ($order) {
        return strpos($order["client_details"]["user_agent"], "Shopify POS") !== false;
    });

    // Si le code postale est donné, filtrer les commandes par code postale
    if ($zip_code) {
        $locations = $client->get('locations')->getDecodedBody()["locations"];
        $filteredLocations = array_filter($locations, function($location) {
            return $location["active"] && !$location["legacy"] && $location["zip"] !== null;
        });
    
        $location_id = null;
        foreach ($filteredLocations as $location) {
            $zip = str_replace(' ', '', $location["zip"]);
            if ($zip == $zip_code) {
                $location_id = $location["id"];
            }
        }
    
        // Filter posOrders based on location_id
        $posOrders = array_filter($posOrders, function ($order) use ($location_id) {
            return $order["location_id"] == $location_id;
        });
    }

    return response(["orders" => array_values($posOrders)]);
})->middleware('shopify.auth');


// App specific routes
Route::get('/api/countries', function () {
    $url = "https://www.mytaxfree.fr/API/_STPays/2023";
    $response = DetaxeApiClient::retrieve_data($url);
    return $response["response_data"];
});

Route::get('/api/verify-shop', function (Request $request) {
    /** @var AuthSession */
    $session = $request->get('shopifySession');

    $shop_id = $request->input('shopId');
    if (!$shop_id) {
        $shop_id = getShopID($session);
    }

    $url = "https://www.mytaxfree.fr/API/_STMag/" . $shop_id;
    $response = DetaxeApiClient::retrieve_data($url);
    return $response["response_data"];
})->middleware('shopify.auth');

Route::get('/api/refund-modes', function (Request $request) {
    /** @var AuthSession */
    $session = $request->get('shopifySession');

    $shop_id = getShopID($session);

    $url = "https://www.mytaxfree.fr/API/_STMag/" . $shop_id;
    $response = DetaxeApiClient::retrieve_data($url);
    return $response["response_data"];
})->middleware('shopify.auth');

Route::get('/api/bve/show', function (Request $request) {
    /** @var AuthSession */
    $session = $request->get('shopifySession');

    $BVEList = [];
    $shop_id = $request->input('shopId');

    // Si le paramètre a été donné, obtenir les bves de cette shop id uniquement
    if ($shop_id) {
        $BVEList = DetaxeApiClient::get_bve_list($shop_id)["response_data"]["BVE"] ?? [];
    }

    // Sinon, obtenir le code parent ainsi que ces fils et obtenir leurs bves
    else {
        $shop_id = getShopID($session);

        $BVEList = DetaxeApiClient::get_bve_list($shop_id)["response_data"]["BVE"] ?? [];

        $client = new Rest($session->getShop(), $session->getAccessToken());

        $result = $client->get('locations');
        $locations = $result->getDecodedBody()["locations"];

        $filteredLocations = array_filter($locations, function($location) {
            return $location["active"] && !$location["legacy"] && $location["zip"] !== null;
        });
        
        foreach ($filteredLocations as $location) {
            $zip = str_replace(' ', '', $location["zip"]);
            $finalShopId = $shop_id . $zip;

            $POSBveList = DetaxeApiClient::get_bve_list($finalShopId)["response_data"]["BVE"] ?? [];

            $BVEList = array_merge($BVEList, $POSBveList);
        }
    }

    return Response()->json($BVEList);
})->middleware('shopify.auth');

Route::get('/api/bve/show/{codebarre}', function (Request $request, $codebarre) {
    /** @var AuthSession */
    $session = $request->get('shopifySession');

    $shop_id = $request->input('shopId');
    if (!$shop_id) {
        $shop_id = getShopID($session);
    }

    $bve_data = DetaxeApiClient::get_bve($codebarre, $shop_id)['response_data'];
    return Response()->json($bve_data);
})->middleware('shopify.auth');

Route::get('/api/bve/delete/{codebarre}', function (Request $request, $codebarre) {
    /** @var AuthSession */
    $session = $request->get('shopifySession');

    $shop_id = $request->input('shopId');
    if (!$shop_id) {
        $shop_id = getShopID($session);
    }

    $bve_data = DetaxeApiClient::delete_bve($codebarre, $shop_id);
    return Response()->json($bve_data);
})->middleware('shopify.auth');

Route::get('/api/bve/generatepdf/{codebarre}', function ($codebarre) {
    $response = DetaxeApiClient::generate_bve_pdf($codebarre);

    $status_code = $response["status_code"];

    if ($status_code == 200) {
        $pdf_data = $response["response_data"];

        $pdf_data = [
            "status" => "success",
            "data" => $pdf_data
        ];

        return Response()->json($pdf_data);
    } else {
        return Response()->json([
            "status" => "error"
        ]);
    }
});

Route::get('/api/bve/generateimg/{codebarre}', function ($codebarre) {
    $response = DetaxeApiClient::generate_bve_img($codebarre);

    $status_code = $response["status_code"];

    if ($status_code >= 200 && $status_code < 300) {
        $hexString = $response["response_data"];

        // Remove all \r and \n in the string
        $hexString = str_replace(["\r", "\n"], '', $hexString);
        // Strip white space from the string
        $hexString = str_replace(' ', '', $hexString);
        // Ensure that the hexString is valid
        if (
            strlen($hexString) % 2 !== 0 ||
            count(preg_split('/[0-9A-Fa-f]{1,2}/', $hexString)) - 1 !== strlen($hexString) / 2
        ) {
            throw new \Exception("$hexString is not a valid hex string.");
        }

        $binaryData = '';
        for ($i = 0; $i < strlen($hexString); $i += 2) {
            $binaryData .= chr(hexdec(substr($hexString, $i, 2)));
        }

        // Create an image from the binary data
        $image = Image::make($binaryData);

        // Define the path where the image will be saved
        $fileName = "$codebarre.png";
        $filePath = public_path("images/$fileName");

        // Check if the file already exists
        if(!file_exists($filePath)) {
            // Create an image from the binary data
            $image = Image::make($binaryData);
            // Save the image to the server
            $image->save($filePath);
        }

        // Generate the URL for the image
        $imageUrl = asset("images/$fileName");

        $img_data = [
            "status_code" => $status_code,
            "data" => $hexString,
            "image_url" => $imageUrl
        ];

        return Response()->json($img_data);
    } else {
        return Response()->json([
            "status_code" => $status_code,
        ]);
    }
});

Route::post('/api/barcode', function (Request $request) {
    /** @var AuthSession */
    $session = $request->get('shopifySession');

    $shop_id = request()->input('shopId');
    if (!$shop_id) {
        $shop_id = getShopID($session);
    }

    $data = $request->json()->all();

    $response = DetaxeApiClient::generate_bar_code($data, $shop_id);
    return $response;
})->middleware('shopify.auth');

Route::post('/api/set-operation-status', function (Request $request) {
    $data = $request->json()->all();
    $barCode = $data['Codebarre'];
    $status = $data['Status'];

    $response = DetaxeApiClient::set_operation_status($barCode, $status);
    return $response;
});

Route::get('/api/passport/get', function(Request $request) {
    $passport = Session::get('passport');
    return response()->json($passport);
});

Route::post('/api/passport/scan', function (Request $request) {
    /** @var AuthSession */
    $session = $request->get('shopifySession');

    $shop_id = $request->input('shopId');
    if (!$shop_id) {
        $shop_id = getShopID($session);
    }

    if (!$request->hasFile('file')) {
        return response()->json(['upload_file_not_found'], 400);
    }

    $file = $request->file('file');
    if (!$file->isValid()) {
        return response()->json(['invalid_file_upload'], 400);
    }

    $date = date('YmdHisv');
    $extension = ".jpg";
    $filename = $shop_id . '-' . $date . $extension;

    $path = public_path() . '/uploads/passports/';
    $file->move($path, $filename);

    $localFile = $path . $filename;
    $remoteFile = '/' . $filename;

    $client = new SFTPClient('109.190.104.95', 22, 'Shopify', 'am6yR8C5fhM2G5');
    $client->uploadFile($localFile, $remoteFile);

    $fileNameWithoutExt = pathinfo($filename, PATHINFO_FILENAME);

    $response = DetaxeApiClient::scan_passport($fileNameWithoutExt, $shop_id);

    return response()->json($response);
})->middleware('shopify.auth');

Route::get('/api/shop', function (Request $request) {
    /** @var AuthSession */
    $session = $request->get('shopifySession');

    $client = new Rest($session->getShop(), $session->getAccessToken());
    $result = $client->get("shop");

    return response($result->getDecodedBody());
})->middleware('shopify.auth');

function getShopID($session) {
    $client = new Rest($session->getShop(), $session->getAccessToken());
    $result = $client->get("shop");

    $shop_id = $result->getDecodedBody()["shop"]["id"];
    return "SH$shop_id";
}
