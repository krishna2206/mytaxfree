import React from "react";
import { Card, Layout, SkeletonBodyText, Stack, Text } from "@shopify/polaris";
import { useAppQuery } from "../hooks";

export default function BveDetail({ code_barre_transmis }) {
    /* const bve = {
        "CodeBarre":"30009999999900100902",
        "Facture":"202306SF12345",
        "AchatLe":"20230525",
        "Nom":"TEST",
        "Prenom":"OTTO",
        "Adresse":"ligne adresse rue1\r\n ligne adresse rue2",
        "IDPays":840,
        "Pays":"Etats-Unis Amerique (USA)",
        "Passeport":"US123456",
        "PassportValid":"20240101",
        "IDNationalite":840,
        "Nationalite":"Etats-Unis Amerique (USA)",
        "Messagerie":"",
        "ReglCarte":true,
        "ReglCheq":false,
        "ReglCash":false,
        "ReglAutre":false,
        "IDMode":10,
        "MTTC":200,
        "MTVA":33.333333,
        "MHT":166.666667,
        "MDetaxe":24,
        "MREMB":24,
        "Compte":"",
        "Beneficiaire":"",
        "Douanes":800, //si le code est à zéro, le BVE peut être modifié
        "Status":"BVE annule", //il vous faudra conserver se numéro dans exCodeBarre
        "PayeLe":"",
        "DateNaissance":"19800101",
        "Mobile":"",
        "DepartLe":"",
        "Articles":
        [
            {
                "Description":"COSTUME",
                "Identification":"",
                "Code":"1",
                "QTT":1,
                "PU":200,
                "TTVA":20,
                "TRMB":12,
                "PTTC":200
            }
        ]
    }  */
    const formatDate = (dateString) => {
        if (dateString) {
            const year = dateString.slice(0, 4);
            const month = dateString.slice(4, 6);
            const day = dateString.slice(6, 8);
            return `${day}-${month}-${year}`;
        }
        return "";
    };
    / const codebarre = "30009999999900100984"; /;
    const {
        data: bve,
        isLoading: isloading_bve,
        status: BveInfoStatus,
    } = useAppQuery({
        url: `/api/bve/show/${code_barre_transmis}`,
    });
    if (isloading_bve) {
        return <SkeletonBodyText />;
    }

    return (
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
                            <Text>ReglCarte: {bve.ReglCarte?.toString()}</Text>
                            <Text>ReglCheq: {bve.ReglCheq?.toString()}</Text>
                            <Text>ReglCash: {bve.ReglCash?.toString()}</Text>
                            <Text>ReglAutre: {bve.ReglAutre?.toString()}</Text>
                            <Text>MTTC: {bve.MTTC}</Text>
                            <Text>MTVA: {bve.MTVA}</Text>
                            <Text>MHT: {bve.MHT}</Text>
                            <Text>MDetaxe: {bve.MDetaxe}</Text>
                            <Text>MREMB: {bve.MREMB}</Text>
                            <Text>Douanes: {bve.Douanes}</Text>
                            <Text>Status: {bve.Status}</Text>
                            <Text>
                                DateNaissance: {formatDate(bve.DateNaissance)}
                            </Text>
                            <Text>Mobile: {bve.Mobile}</Text>
                            <Text>Articles:</Text>

                            {bve.Articles?.map((article) => (
                                <div key={article.Code}>
                                    <Text> {article.Description}</Text>
                                    <Text>
                                        Identification: {article.Identification}
                                    </Text>
                                    <Text>Code: {article.Code}</Text>
                                    <Text>QTT: {article.QTT}</Text>
                                    <Text>PU: {article.PU}</Text>
                                    <Text>TTVA: {article.TTVA}</Text>
                                    <Text>TRMB: {article.TRMB}</Text>
                                    <Text>PTTC: {article.PTTC}</Text>
                                </div>
                            ))}
                            {/ Ajouter d'autres champs du BVE ici /}
                        </Stack>
                    </Layout.Section>
                    <Layout.Section>
                        {
                            / Ajouter d'autres sections de mise en page pour les autres champs du BVE ici /
                        }
                    </Layout.Section>
                </Layout>
            </Card.Section>
        </Card>
    );
}
