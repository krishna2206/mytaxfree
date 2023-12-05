import React, { useContext } from "react";

import { Redirect } from "@shopify/app-bridge/actions";
import { Context, TitleBar } from "@shopify/app-bridge-react";
import { Button, VerticalStack } from "@shopify/polaris";
import { IdentityCardMajor, FormsMajor } from "@shopify/polaris-icons";

import SpacingBackground from "../../../components/SpacingBackground";

export default function BveCreationMenu() {
    const app = useContext(Context);

    const handleMenuClick = () => {
        const redirect = Redirect.create(app);
        redirect.dispatch(Redirect.Action.APP, `/`);
    };

    const handlePasseportScanClick = () => {
        const redirect = Redirect.create(app);
        redirect.dispatch(Redirect.Action.APP, `/bve/create/scan-passport`);
    };

    const handleBveCreationFormClick = () => {
        const redirect = Redirect.create(app);
        redirect.dispatch(Redirect.Action.APP, `/bve/create/from-orders`);
    };

    return (
        <>
            <TitleBar
                title="Menu création de détaxe"
                primaryAction={
                    {
                        content: 'Retour au menu',
                        onAction: () => handleMenuClick(),
                    }
                }/>
            <SpacingBackground>
                <VerticalStack gap="5">
                    <Button
                        icon={IdentityCardMajor}
                        primary
                        onClick={handlePasseportScanClick}
                    >
                        &nbsp; Scanner le passeport du voyageur
                    </Button>
                    <Button
                        icon={FormsMajor}
                        primary
                        onClick={handleBveCreationFormClick}
                    >
                        &nbsp; Ignorer cette étape et saisir les informations
                    </Button>
                </VerticalStack>
            </SpacingBackground>
        </>
    );
}
