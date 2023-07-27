import { useParams } from "react-router-dom";

import React, { useContext } from "react";
import { Card, Layout, SkeletonBodyText, Stack, Text } from "@shopify/polaris";
import { useAppQuery } from "../../../hooks";
import { Context, TitleBar } from "@shopify/app-bridge-react";
import { Redirect } from "@shopify/app-bridge/actions";

export default function BVEPage() {
    const { codebarre } = useParams();

    const formatDate = (dateString) => {
        if (dateString) {
            const year = dateString.slice(0, 4);
            const month = dateString.slice(4, 6);
            const day = dateString.slice(6, 8);
            return `${day}-${month}-${year}`;
        }
        return "";
    };

    const {
        data: bve,
        isLoading: isloading_bve,
        status: BveInfoStatus,
    } = useAppQuery({
        url: `/api/bve/show/${codebarre}`,
    });
    if (isloading_bve) {
        return (
            <>
                <TitleBar
                    title={`Détail du détaxe N° ${codebarre}`}
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
                <SkeletonBodyText />
            </>
        );
    }

    const app = useContext(Context);

    const handleMenuClick = () => {
        const redirect = Redirect.create(app);
        redirect.dispatch(Redirect.Action.APP, `/`);
    };
    const handleBVEListClick = () => {
        const redirect = Redirect.create(app);
        redirect.dispatch(Redirect.Action.APP, `/bve/list`);
    };

    return (
        <>
            <TitleBar
                title={`Détail du détaxe N° ${codebarre}`}
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

            <Card title="Détails du BVE">
                <Card.Section>
                    <Layout>
                        <Layout.Section>
                            <Stack vertical>
                                <Text>CodeBarre: {bve.CodeBarre}</Text>
                                <Text>Facture: {bve.Facture}</Text>
                                <Text>AchatLe: {formatDate(bve.AchatLe)}</Text>
                                <Text>Nom: {bve.Nom}</Text>
                                <Text>Prénom: {bve.Prenom}</Text>
                                <Text>Adresse: {bve.Adresse}</Text>
                                <Text>Pays: {bve.Pays}</Text>
                                <Text>Passeport: {bve.Passeport}</Text>
                                <Text>PassportValid: {bve.PassportValid}</Text>
                                <Text>Nationalité: {bve.Nationalite}</Text>
                                <Text>
                                    ReglCarte: {bve.ReglCarte?.toString()}
                                </Text>
                                <Text>
                                    ReglCheq: {bve.ReglCheq?.toString()}
                                </Text>
                                <Text>
                                    ReglCash: {bve.ReglCash?.toString()}
                                </Text>
                                <Text>
                                    ReglAutre: {bve.ReglAutre?.toString()}
                                </Text>
                                <Text>MTTC: {bve.MTTC}</Text>
                                <Text>MTVA: {bve.MTVA}</Text>
                                <Text>MHT: {bve.MHT}</Text>
                                <Text>MDetaxe: {bve.MDetaxe}</Text>
                                <Text>MREMB: {bve.MREMB}</Text>
                                <Text>Douanes: {bve.Douanes}</Text>
                                <Text>Status: {bve.Status}</Text>
                                <Text>
                                    DateNaissance:{" "}
                                    {formatDate(bve.DateNaissance)}
                                </Text>
                                <Text>Mobile: {bve.Mobile}</Text>
                                <Text>Articles:</Text>

                                {bve.Articles?.map((article) => (
                                    <div key={article.Code}>
                                        <Text> {article.Description}</Text>
                                        <Text>
                                            Identification:{" "}
                                            {article.Identification}
                                        </Text>
                                        <Text>Code: {article.Code}</Text>
                                        <Text>QTT: {article.QTT}</Text>
                                        <Text>PU: {article.PU}</Text>
                                        <Text>TTVA: {article.TTVA}</Text>
                                        <Text>TRMB: {article.TRMB}</Text>
                                        <Text>PTTC: {article.PTTC}</Text>
                                    </div>
                                ))}
                            </Stack>
                        </Layout.Section>
                        <Layout.Section></Layout.Section>
                    </Layout>
                </Card.Section>
            </Card>
        </>
    );
}
