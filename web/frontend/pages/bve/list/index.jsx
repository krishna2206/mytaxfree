import {
    Page,
    Layout,
    Grid,
} from "@shopify/polaris";
import { Context, TitleBar } from "@shopify/app-bridge-react";
import { StoryCard } from "../../../components/StoryCard";
import { Redirect } from "@shopify/app-bridge/actions";
import { useContext } from "react";

export default function BveList() {
    const app = useContext(Context);

    const handleMenuClick = () => {
        const redirect = Redirect.create(app);
        redirect.dispatch(Redirect.Action.APP, `/`);
    };

    return (
        <Page fullWidth>
            <TitleBar title="Liste des dernières detaxes" primaryAction={
                {
                    content: 'Retour au menu',
                    onAction: () => handleMenuClick(),
                }
            } />
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
