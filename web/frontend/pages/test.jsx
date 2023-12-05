import { Banner, Text } from "@shopify/polaris";
import { useAuthenticatedFetch } from "../hooks";
import React, { useState, useEffect, useContext } from "react";
import createApp from '@shopify/app-bridge';
import { isShopifyPOS } from '@shopify/app-bridge/utilities';
import { Context } from "@shopify/app-bridge-react";


export default function TestPage() {
    const fetch = useAuthenticatedFetch();
    const [hostInfo, setHost] = useState(null);
    const [pos, setPos] = useState(null);
    const app = useContext(Context);

    app.getState('pos')
        .then((data) => {
            setPos(data);
        })

    let message = "";

    useEffect(() => {
        if (isShopifyPOS()) {
            setHost("The app is running on Shopify POS");
        } else {
            setHost("The app is running on the web");
        }
    }, []);

    return (
        <>
            <Text variant="headingXl" as="h4">
                Test
            </Text>
            <Banner
                title="Test"
                status="info"
            >
                <p>Test</p>
                <pre>{message}</pre>
                <pre>{JSON.stringify(pos, null, 2)}</pre>
                <pre>{hostInfo}</pre>
            </Banner>
        </>
    );
}
