// Verification.jsx
import React, { useEffect, useState } from "react";
import { useAuthenticatedFetch } from "@shopify/app-bridge-react";
import {
    Banner,
    SkeletonBodyText,
    VerticalStack,
} from "@shopify/polaris";
import SpacingBackground from "./components/SpacingBackground";

export default function Verification({ children }) {
    const fetch = useAuthenticatedFetch();

    const [isLoading, setIsLoading] = useState(true);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isError, setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        fetch("/api/refund-modes")
            .then((response) => response.json())
            .then((data) => {
                if (!data.hasOwnProperty("Titre")) {
                    setIsSuccess(true);
                    setIsLoading(false);
                } else {
                    fetch("/api/shop")
                        .then((response) => response.json())
                        .then((secondData) => {
                            setIsError(true);
                            setIsLoading(false);

                            if (data.Titre == "Identifiant inconnu") {
                                setErrorMessage(
                                    `Erreur, vous n'avez pas accès à cette application pour le moment :\n\nIdentifiant inconnu - Merci de contacter Simply Tax Free au 02 28 03 52 79 pour obtenir votre accès au service de détaxe en fournissant votre code boutique.\r\nBien cordialement\r\nserviceclient@simplytaxfree.fr\n\nVotre code boutique : SH${secondData.shop.id}`
                                );
                            } else {
                                setErrorMessage(
                                    `Erreur, vous n'avez pas accès à cette application pour le moment :\n\n${data.Titre} - ${data.Message}`
                                );
                            }
                        });
                }
            });
    }, []);

    if (isLoading) {
        return (
            <SpacingBackground>
                <SkeletonBodyText lines={7} />
            </SpacingBackground>
        );
    }

    if (isSuccess) {
        return children;
    } else {
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
