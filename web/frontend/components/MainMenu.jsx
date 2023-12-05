import React, { useContext } from "react";

import { AddMajor, ListMajor, CodeMajor } from "@shopify/polaris-icons";
import { Button, VerticalStack, Text } from "@shopify/polaris";
import { Redirect } from "@shopify/app-bridge/actions";
import { Context, TitleBar } from "@shopify/app-bridge-react";

import SpacingBackground from "./SpacingBackground";
import { MyTaxFreeContext } from "./providers/MyTaxFreeProvider";

export default function MainMenu() {
    const app = useContext(Context);
    const { shopID } = useContext(MyTaxFreeContext);

    const handleBveCreationMenuClick = () => {
        const redirect = Redirect.create(app);
        redirect.dispatch(Redirect.Action.APP, `/bve/create`);
    };

    const handleBveListClick = () => {
        const redirect = Redirect.create(app);
        redirect.dispatch(Redirect.Action.APP, `/bve/list`);
    };

    const handleTestPageClick = () => {
        const redirect = Redirect.create(app);
        redirect.dispatch(Redirect.Action.APP, `/test`);
    };

    return (
        <>
            <TitleBar title="Menu détaxe" />
            <SpacingBackground>
                <VerticalStack gap="5">
                    <Text variant="headingXl" as="h4">
                        Code votre boutique : <strong>{shopID}</strong>
                    </Text>

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
                    {/* <Button
                        icon={CodeMajor}
                        primary
                        onClick={handleTestPageClick}
                    >
                        &nbsp; Playground test page
                    </Button> */}
                </VerticalStack>
            </SpacingBackground>
        </>
    );

}
