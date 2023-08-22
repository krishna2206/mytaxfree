<?php

use App\Exceptions\ShopifyProductCreatorException;
use App\Lib\AuthRedirection;
use App\Lib\CurlCustom;
use App\Lib\EnsureBilling;
use App\Lib\ProductCreator;
use App\Lib\SFTPClient;
use App\Lib\Utils as AppUtils;
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

// Authentication
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

Route::get('/api/refund-modes', function (Request $request) {
    /** @var AuthSession */
    $session = $request->get('shopifySession');

    // $shop_id = "SH12345678"; // TODO : To be removed
    $shop_id = getShopID($session);

    $url = "https://www.mytaxfree.fr/API/_STMag/" . $shop_id;
    $response = CurlCustom::retrieve_data($url);
    return $response["response_data"];
})->middleware('shopify.auth');

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

Route::get('/api/bve/generatepdf/{codebarre}', function ($codebarre) {
    $response = CurlCustom::generer_pdf($codebarre);

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

Route::post('/api/barcode', function (Request $request) {
    /** @var AuthSession */
    $session = $request->get('shopifySession');

    // $shop_id = "SH12345678"; // TODO : To be removed
    $shop_id = getShopID($session);

    $data = $request->json()->all();

    $response = CurlCustom::generate_bar_code($data, $shop_id);
    return $response;
})->middleware('shopify.auth');

Route::post('/api/set-operation-status', function (Request $request) {
    $data = $request->json()->all();
    $barCode = $data['Codebarre'];
    $status = $data['Status'];

    $response = CurlCustom::set_operation_status($barCode, $status);
    return $response;
});

Route::post('/api/passport/scan', function (Request $request) {
    /** @var AuthSession */
    $session = $request->get('shopifySession');

    // $shop_id = "SH12345678"; // TODO : To be removed
    $shop_id = getShopID($session);

    if (!$request->hasFile('file')) {
        return response()->json(['upload_file_not_found'], 400);
    }

    $file = $request->file('file');
    if (!$file->isValid()) {
        return response()->json(['invalid_file_upload'], 400);
    }

    $date = date('YmdHisv');
    $extension = '.' . $file->getClientOriginalExtension();
    $filename = $shop_id . '-' . $date . $extension;

    $path = public_path() . '/uploads/passports/';
    $file->move($path, $filename);

    $localFile = $path . $filename;
    $remoteFile = '/' . $filename;

    $client = new SFTPClient('109.190.104.95', 22, 'Shopify', 'am6yR8C5fhM2G5');
    $client->uploadFile($localFile, $remoteFile);

    $fileNameWithoutExt = pathinfo($filename, PATHINFO_FILENAME);

    $response = CurlCustom::scan_passport($fileNameWithoutExt, $shop_id);

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


// Route::get("/api/uid", function (Request $request) {
//     /** @var AuthSession */
//     $session = $request->get('shopifySession');

//     return response()->json([
//         "uid" => $session->getShop() . "." . AppUtils::v3_UUID("5f6384bfec4ca0b2d4114a13aa2a5435", $session->getAccessToken()),
//     ]);
// })->middleware("shopify.auth");
