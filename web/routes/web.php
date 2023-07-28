<?php

use App\Exceptions\ShopifyProductCreatorException;
use App\Lib\AuthRedirection;
use App\Lib\CurlCustom;
use App\Lib\EnsureBilling;
use App\Lib\ProductCreator;
use App\Lib\SFTPClient;
use App\Models\Session;
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

// Shopify-related routes
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

Route::get('/api/products/count', function (Request $request) {
    /** @var AuthSession */
    $session = $request->get('shopifySession'); // Provided by the shopify.auth middleware, guaranteed to be active

    $client = new Rest($session->getShop(), $session->getAccessToken());
    $result = $client->get('products/count');

    return response($result->getDecodedBody());
})->middleware('shopify.auth');

Route::get('/api/products/create', function (Request $request) {
    /** @var AuthSession */
    $session = $request->get('shopifySession'); // Provided by the shopify.auth middleware, guaranteed to be active

    $success = $code = $error = null;
    try {
        ProductCreator::call($session, 5);
        $success = true;
        $code = 200;
        $error = null;
    } catch (\Exception $e) {
        $success = false;

        if ($e instanceof ShopifyProductCreatorException) {
            $code = $e->response->getStatusCode();
            $error = $e->response->getDecodedBody();
            if (array_key_exists("errors", $error)) {
                $error = $error["errors"];
            }
        } else {
            $code = 500;
            $error = $e->getMessage();
        }

        Log::error("Failed to create products: $error");
    } finally {
        return response()->json(["success" => $success, "error" => $error], $code);
    }
})->middleware('shopify.auth');

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

Route::get('/api/orders', function (Request $request) {
    /** @var AuthSession */
    $session = $request->get('shopifySession');

    $client = new Rest($session->getShop(), $session->getAccessToken());
    $result = $client->get('orders');

    return response($result->getDecodedBody());
})->middleware('shopify.auth');

Route::get('/api/orders/{id}', function (Request $request, $id) {
    /** @var AuthSession */
    $session = $request->get('shopifySession');

    $client = new Rest($session->getShop(), $session->getAccessToken());
    $result = $client->get("orders/$id");

    return response($result->getDecodedBody());
})->middleware('shopify.auth');

// App specific routes
Route::get('/api/countries', function () {
    $url = "https://www.mytaxfree.fr/API/_STPays/2023";
    $response = CurlCustom::retrieve_data($url);
    return $response["response_data"];
});

Route::get('/api/refund-modes', function () {
    $seller_id = "SH12345678"; // TODO : To be removed

    $url = "https://www.mytaxfree.fr/API/_STMag/" . $seller_id;
    $response = CurlCustom::retrieve_data($url);
    return $response["response_data"];
});

Route::get('/api/bve/show', function (Request $request) {
    $barcode = $request->input("barcode");
    if ($barcode) {
        $bve_data = CurlCustom::get_bve($barcode, "SH12345678")['response_data'];
        dd($bve_data);
    }
    $bves = CurlCustom::get_BVEs("SH12345678")["response_data"]["BVE"] ?? [];
    return Response()->json($bves);
});

Route::get('/api/bve/show/{codebarre}', function (Request $request, $codebarre) {
    $bve_data = CurlCustom::get_bve($codebarre, "SH12345678")['response_data'];
    return Response()->json($bve_data);
});

Route::post('/api/barcode', function (Request $request) {
    $seller_id = "SH12345678"; // TODO : To be removed

    $data = $request->json()->all();

    // Statique juste pour test
    // $data['MTTC'] = 200;
    // $data['MTVA'] = 33.33;
    // $data['MHT'] = 166.67;

    // $data['Articles'] = [
    //     [
    //         "Code" => "1",
    //         "Description" => "Montre",
    //         "Identification" => "NS 123456",
    //         "PU" => 100,
    //         "PTTC" => 100,
    //         "QTT" => 1,
    //         "TTVA" => 20,
    //         "PTVA" => 16.65
    //     ],
    //     [
    //         "Code" => "2",
    //         "Description" => "Bague",
    //         "Identification" => "",
    //         "PU" => 100,
    //         "PTTC" => 100,
    //         "QTT" => 1,
    //         "TTVA" => 20,
    //         "PTVA" => 16.65
    //     ]
    // ];

    $response = CurlCustom::generate_bar_code($data, $seller_id);
    return $response;
});

Route::post('/api/set-operation-status', function (Request $request) {
    $data = $request->json()->all();
    $barCode = $data['Codebarre'];
    $status = $data['Status'];

    $response = CurlCustom::set_operation_status($barCode, $status);
    return $response;
});

Route::post('/api/passport/scan', function (Request $request) {
    if (!$request->hasFile('file')) {
        return response()->json(['upload_file_not_found'], 400);
    }

    $file = $request->file('file');
    if (!$file->isValid()) {
        return response()->json(['invalid_file_upload'], 400);
    }

    $seller_id = "SH12345678"; // TODO : To be removed

    $date = date('YmdHisv');
    $extension = '.' . $file->getClientOriginalExtension();
    $filename = $seller_id . '-' . $date . $extension;

    $path = public_path() . '/uploads/passports/';
    $file->move($path, $filename);

    $localFile = $path . $filename;
    $remoteFile = '/' . $filename;

    $client = new SFTPClient('109.190.104.95', 22, 'Shopify', 'am6yR8C5fhM2G5');
    $client->uploadFile($localFile, $remoteFile);

    $fileNameWithoutExt = pathinfo($filename, PATHINFO_FILENAME);

    $response = CurlCustom::scan_passport($fileNameWithoutExt, $seller_id);

    return response()->json($response);
});
