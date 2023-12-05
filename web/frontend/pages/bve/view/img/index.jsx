import React, { useContext, useEffect, useState } from 'react';

import { Banner, Button, Text } from "@shopify/polaris";
import { Context, TitleBar } from "@shopify/app-bridge-react";
import { Redirect } from "@shopify/app-bridge/actions";

function hexToBase64(hexString) {
    // Remove all \r and \n in the string
    hexString = hexString.replace(/[\r\n]+/gm, "");
    // Strip white space from the string
    hexString = hexString.replace(/\s+/g, "");
    // Ensure that the hexString is valid
    if (
        hexString.length % 2 !== 0 ||
        hexString.match(/[0-9A-Fa-f]{1,2}/g).length !== hexString.length / 2
    ) {
        throw new Error(`${hexString} is not a valid hex string.`);
    }

    return btoa(String.fromCharCode.apply(null, hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16))));
}

export default function BVEImgRenderPage() {
    const app = useContext(Context);
    const imgUrls = JSON.parse(localStorage.getItem("bve_img_urls")) || []; // Fetch array from localStorage

    const [imgSrcs, setImgSrcs] = useState([]);

    useEffect(() => {
        setImgSrcs(imgUrls);
    }, []);

    const handleMenuClick = () => {
        localStorage.removeItem("bve_img_urls");
        const redirect = Redirect.create(app);
        redirect.dispatch(Redirect.Action.APP, `/`);
    };

    const handleBVEListClick = () => {
        localStorage.removeItem("bve_img_urls");
        const redirect = Redirect.create(app);
        redirect.dispatch(Redirect.Action.APP, `/bve/list`);
    };

    return (
        <div style={{ padding: "20px" }}>
            <Banner onDismiss={() => { }}>
                <p>
                    Aperçu de l'image de la détaxe. La fonctionnalité de téléchargement du PDF n'est pas disponible sur Shopify PDV, veuillez utiliser la version web de Shopify pour pouvoir télécharger le PDF de la détaxe.
                </p>
            </Banner>
            {imgSrcs.map((imgSrc, index) => (
                <div key={index} style={{ width: "100%" }}>
                    <img src={imgSrc} alt={`BVE Image ${index + 1}`} width="100%" />
                </div>
            ))}
            <TitleBar
                title={`Image du BVE`}
                primaryAction={{
                    content: "Retour à la liste des détaxes",
                    onAction: () => handleBVEListClick(),
                }}
                secondaryActions={[
                    {
                        content: "Retour au menu",
                        onAction: () => handleMenuClick(),
                    },
                ]}
            />
        </div>
    );
}
