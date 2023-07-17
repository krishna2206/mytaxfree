<?php

namespace App\Lib;

class CurlCustom
{
    /**
     * Does a curl call and gets data
     * @param string $url the WebService url
     * @return array[] ["response_data" => $data, "status_code" => $status_code]
     */
    public static function retrieve_data(string $url): array
    {
        $curl = curl_init();
        curl_setopt_array($curl, array(
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => '',
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 0,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => 'GET',
            CURLOPT_HTTPHEADER => array(
                'X-External-Agent-Code: MyTaxFree',
                'Authorization: Bearer 4$hopify$'
            ),
        ));
        $response = curl_exec($curl);
        curl_close($curl);

        return [
            "response_data" => json_decode($response, true),
            "status_code" => curl_getinfo($curl, CURLINFO_HTTP_CODE)
        ];
    }

    public static function generate_bar_code($data, $docid)
    {
        $curl = curl_init();
        curl_setopt_array($curl, array(
            CURLOPT_URL => "https://www.mytaxfree.fr/API/_STBve/$docid",
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => '',
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 0,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => 'POST',
            CURLOPT_POSTFIELDS => json_encode($data),
            CURLOPT_HTTPHEADER => array(
                'X-External-Agent-Code: MyTaxFree',
                'Content-Type : application/x-www-form-urlencoded',
                'Authorization: Bearer 4$hopify$'
            ),
        ));
        $response = curl_exec($curl);

        curl_close($curl);

        // Traitez la réponse ici
        return [
            "response_data" => $response,
            "status_code" => curl_getinfo($curl, CURLINFO_HTTP_CODE)
        ];
    }

    public static function set_operation_status(?string $status = "OK"): array
    {
        $curl = curl_init();
        curl_setopt_array($curl, array(
            CURLOPT_URL => "https://www.mytaxfree.fr/API/_STBveOk/$status",
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => '',
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 0,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => 'POST',
            CURLOPT_HTTPHEADER => array(
                'X-External-Agent-Code: MyTaxFree',
                'Authorization: Bearer 4$hopify$'
            ),
        ));
        $response = curl_exec($curl);
        curl_close($curl);

        return [
            // "response_data" => json_decode($response, true),
            "status_code" => curl_getinfo($curl, CURLINFO_HTTP_CODE)
        ];
    }

    public static function get_BVEs($docid)
    {
        $curl = curl_init();
        curl_setopt_array($curl, array(
            // hAps://https://www.mytaxfree.fr/API/_STBve/{DocId}
            CURLOPT_URL => "https://www.mytaxfree.fr/API/_STBdx/$docid",
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => '',
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 0,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,

            CURLOPT_CUSTOMREQUEST => 'GET',
            CURLOPT_HTTPHEADER => array(
                'X-External-Agent-Code: MyTaxFree',
                'Authorization: Bearer 4$hopify$'
            ),
        ));
        $response = curl_exec($curl);
        curl_close($curl);

        return [
            "response_data" => json_decode($response, true),
            "status_code" => curl_getinfo($curl, CURLINFO_HTTP_CODE)
        ];
    }

    public static function get_bve($barcode, $seller_id)
    {
        $curl = curl_init();
        $payload = json_encode(["DocID" => $barcode]);
        curl_setopt_array($curl, array(
            CURLOPT_URL => "https://www.mytaxfree.fr/API/_STBve/" . $seller_id,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => '',
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 0,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => 'GET',
            CURLOPT_POSTFIELDS => $payload,
            CURLOPT_HTTPHEADER => array(
                'X-External-Agent-Code: MyTaxFree',
                'Authorization: Bearer 4$hopify$'
            ),
        ));
        $response = curl_exec($curl);
        curl_close($curl);

        return [
            "response_data" => json_decode($response, true),
            "status_code" => curl_getinfo($curl, CURLINFO_HTTP_CODE)
        ];
    }
}
