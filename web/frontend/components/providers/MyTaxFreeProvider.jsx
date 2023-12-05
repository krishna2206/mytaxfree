import React, { useContext, useEffect, useState } from "react";
import { Context, useAuthenticatedFetch } from "@shopify/app-bridge-react";
import {
    Banner,
    SkeletonBodyText,
    VerticalStack,
} from "@shopify/polaris";
import { isShopifyPOS } from '@shopify/app-bridge/utilities';
import SpacingBackground from "../SpacingBackground";

// Create Context
export const MyTaxFreeContext = React.createContext();

export default function MyTaxFreeProvider({ children }) {
    const fetch = useAuthenticatedFetch();
    const app = useContext(Context);

    const [isLoading, setIsLoading] = useState(true);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isError, setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [posData, setPosData] = useState(null);
    const [shopData, setShopData] = useState(null);
    const [baseShopID, setBaseShopID] = useState(null);
    const [shopID, setShopID] = useState(null);
    const [zipCode, setZipCode] = useState(null);

    const shopAccessDeniedErrMsg = `Erreur, vous n'avez pas accès à cette application pour le moment :\n\nIdentifiant inconnu - Merci de contacter Simply Tax Free au 02 28 03 52 79 pour obtenir votre accès au service de détaxe en fournissant votre code boutique.\r\nBien cordialement\r\nserviceclient@simplytaxfree.fr\n\nVotre code boutique : SH`;
    const posAccessDeniedErrMsg = `Erreur, votre Point De Vente actuel n'as pas accès à cette application pour le moment :\n\nIdentifiant inconnu - Merci de contacter Simply Tax Free au 02 28 03 52 79 pour obtenir votre accès au service de détaxe en fournissant le code boutique de votre Point De Vente\r\nBien cordialement\r\nserviceclient@simplytaxfree.fr\n\nCode boutique de votre Point De Vente : `;
    const invalidPosErrMsg = `Erreur, votre Point De Vente actuel ne contient pas une code postal valide, veuillez configurer votre emplacement dans l'application Shopify Mobile ou sur l'interface admin.\n\nAssurez-vous que votre Point De Vente est aussi autorisé à utiliser cette application en contactant Simply Tax Free au 02 28 03 52 79.\r\nBien cordialement\r\nserviceclient@simplytaxfree.fr`;

    useEffect(() => {
        app.getState('pos')
            .then((data) => {
                setPosData(data);
            });
    }, [app]);

    useEffect(() => {
        fetch("/api/shop")
            .then(response => response.json())
            .then(data => {
                setShopData(data);
                setBaseShopID("SH" + data.shop.id);
            })
            .catch((error) => {
                setIsError(true);
                setIsLoading(false);
                setErrorMessage(`Une erreur est survenue lors de la récupération des informations de la boutique : ${error.message}`);
              });
    }, [fetch]);
    
    const [shopIdValid, setShopIdValid] = useState(false);
    useEffect(() => {
        if (baseShopID) {
            if (isShopifyPOS()) {
                if (posData.location.zip == null || posData.location.zip == "" || posData.location.zip.split(" ").length > 1) {
                    setIsError(true);
                    setIsLoading(false);
                    setErrorMessage(
                        invalidPosErrMsg + `\n\nVotre Point De Vente : ${posData.location.name}`
                    );
                    setShopIdValid(false);
                } else {
                    setShopID(baseShopID + posData.location.zip);
                    setZipCode(posData.location.zip);
                    setShopIdValid(true);
                }
            } else {
                setShopID(baseShopID);
                setShopIdValid(true);
            }
        }
    }, [baseShopID]);

    useEffect(() => {
        if (shopIdValid) {
            console.log("Verify shop" + shopID)

            const verifyShopAPIUrl = isShopifyPOS() ? `/api/verify-shop?shopId=${shopID}` : `/api/verify-shop`;

            fetch(verifyShopAPIUrl)
                .then((response) => response.json())
                .then((data) => {
                    if (!data.hasOwnProperty("Titre")) {
                        setIsSuccess(true);
                        setIsLoading(false);
                    } 
                    else {
                        setIsError(true);
                        setIsLoading(false);

                        if (data.Titre == "Identifiant inconnu") {
                            if (isShopifyPOS()) {
                                setErrorMessage(posAccessDeniedErrMsg + shopID);
                            } else {
                                setErrorMessage(shopAccessDeniedErrMsg + shopID);
                            }
                        } else {
                            setErrorMessage(
                                `Erreur, vous n'avez pas accès à cette application pour le moment :\n\n${data.Titre} - ${data.Message}`
                            );
                        }

                    }
                })
                .catch((error) => {
                    setIsError(true);
                    setIsLoading(false);
                    setErrorMessage(`Une erreur est survenue lors de la vérification de la boutique : ${error.message}`);
                  });
        }
    }, [shopID, shopIdValid]);

    const [contextValue, setContextValue] = useState(null);
    useEffect(() => {
        setContextValue({
            posData: posData,
            shopID: shopID,
            zipCode: zipCode,
        });
    }, [posData, shopID, zipCode]);

    if (isLoading) {
        return (
            <SpacingBackground>
                <SkeletonBodyText lines={7} />
            </SpacingBackground>
        );
    }

    if (isSuccess) {
        return (
            <MyTaxFreeContext.Provider value={contextValue}>
                {children}
            </MyTaxFreeContext.Provider>
        );
    } 
    
    if (isError) {
        const messageLines = errorMessage.split("\n").map((line, i) => (
            <React.Fragment key={i}>
                {line}
                <br />
            </React.Fragment>
        ));

        return (
            <SpacingBackground>
                <VerticalStack gap="5">
                    <Banner status="critical">{messageLines}</Banner>
                </VerticalStack>
            </SpacingBackground>
        );
    }
}
