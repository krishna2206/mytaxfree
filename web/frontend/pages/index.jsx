import { Context, TitleBar } from "@shopify/app-bridge-react";
import { Redirect } from "@shopify/app-bridge/actions";
import { Button, VerticalStack } from "@shopify/polaris";
import { AddMajor, ListMajor, ExitMajor } from "@shopify/polaris-icons";
import React, { useContext } from "react";
import SpacingBackground from "../components/SpacingBackground";

export default function MainMenu() {
    const app = useContext(Context);

    const handleBveCreationMenuClick = () => {
        const redirect = Redirect.create(app);
        redirect.dispatch(Redirect.Action.APP, `/bve/create`);
    };

    const handleBveListClick = () => {
        const redirect = Redirect.create(app);
        redirect.dispatch(Redirect.Action.APP, `/bve/list`);
    };

    return (
        <>
            <TitleBar title="Menu détaxe" />
            <SpacingBackground>
                <VerticalStack gap="5">
                    <Button
                        icon={AddMajor}
                        primary
                        onClick={handleBveCreationMenuClick}
                    >
                        &nbsp; Nouvelle détaxe
                    </Button>
                    <Button
                        icon={ListMajor}
                        primary
                        onClick={handleBveListClick}
                    >
                        &nbsp; Dernière détaxes
                    </Button>
                    {/* <Button icon={ExitMajor}>
                        &nbsp; Fermer le programme de la détaxe
                    </Button> */}
                </VerticalStack>
            </SpacingBackground>
        </>
    );
}
