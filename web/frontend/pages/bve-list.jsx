import {
    Card,
    Page,
    Layout,
    TextContainer,
    Text,
    Grid,
    Link,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useTranslation } from "react-i18next";
import { StoryCard } from "../components/StoryCard";
import BveDetail from "../components/BveDetail";
import { useState } from "react";

export default function BveList() {
    const { t } = useTranslation();
    return (
        <Page fullWidth>
            <TitleBar title="Liste des BVE" primaryAction={null} />
            <Grid>
                <Grid.Cell
                    columnSpan={{ xs: 10, sm: 3, md: 5, lg: 10, xl: 10 }}
                >
                    <Layout>
                        <Layout.Section>
                            <StoryCard></StoryCard>
                        </Layout.Section>
                    </Layout>
                </Grid.Cell>
            </Grid>
        </Page>
    );


}
