import { Context, TitleBar } from "@shopify/app-bridge-react";
import { Redirect } from "@shopify/app-bridge/actions";
import { Button, VerticalStack, Text, SkeletonBodyText } from "@shopify/polaris";
import { AddMajor, ListMajor } from "@shopify/polaris-icons";
import React, { useContext } from "react";
import SpacingBackground from "../components/SpacingBackground";
import { useAppQuery } from "../hooks";

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

    const {
        data,
        isLoading,
        isSuccess
    } = useAppQuery({
        url: `/api/shop`,
    });

    if (isLoading && !data) {
        return (
            <>
                <TitleBar title="Menu détaxe" />
                <SpacingBackground>
                    <SkeletonBodyText lines={7}/>
                </SpacingBackground>
            </>
        );
    }

    if (isSuccess && data) {
        return (
            <>
                <TitleBar title="Menu détaxe" />
                <SpacingBackground>
                    <VerticalStack gap="5">
                        <Text variant="headingXl" as="h4">
                            Code votre boutique : <strong>SH{data.shop.id}</strong>
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
                    </VerticalStack>
                </SpacingBackground>
            </>
        );
    }

}
