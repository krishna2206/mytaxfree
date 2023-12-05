import { useParams } from "react-router-dom";
import React, { useCallback, useContext, useState } from "react";

import { Button, Card, Layout, Modal, SkeletonBodyText, Spinner, Stack, Text, TextContainer, Toast, Frame } from "@shopify/polaris";
import { PrintMajor, DeleteMajor } from "@shopify/polaris-icons";
import { Redirect } from "@shopify/app-bridge/actions";
import { isShopifyPOS } from "@shopify/app-bridge/utilities";
import { Context, TitleBar } from "@shopify/app-bridge-react";

import { useAppQuery, useAuthenticatedFetch } from "../../../hooks";
import { MyTaxFreeContext } from "../../../components/providers/MyTaxFreeProvider";

const formatDate = (dateString) => {
    if (dateString) {
        const year = dateString.slice(0, 4);
        const month = dateString.slice(4, 6);
        const day = dateString.slice(6, 8);
        return `${day}-${month}-${year}`;
    }
    return "";
};

const hexToBinary = (hexString) => {
    // Remove all \r and \n in the string
    hexString = hexString.replace(/[\r\n]+/gm, "");
    // Strip white space from the string
    hexString = hexString.replace(/\s+/g, "");
    // Ensure that the hexString is valid
    if (
        hexString.length % 2 !== 0 ||
        hexString.match(/[0-9A-Fa-f]{1,2}/g).length !== hexString.length / 2
    ) {
        throw new Error(`${hexString} is not a valid hex string.`);
    }

    const binary = new Uint8Array(hexString.length / 2);
    for (let i = 0; i < hexString.length; i += 2) {
        binary[i / 2] = parseInt(hexString.substr(i, 2), 16);
    }
    return binary;
};

export default function BVEPage() {
    const { codebarre } = useParams();
    const fetch = useAuthenticatedFetch();
    const app = useContext(Context);
    const { shopID } = useContext(MyTaxFreeContext);

    const [isLoadingButton, setIsLoadingButton] = useState(false);
    const [activeModale, setActiveModale] = useState(false);
    const [activeDeleteModal, setActiveDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [activeToast, setActiveToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");

    const {
        data: bve,
        isLoading: isloading_bve,
        status: BveInfoStatus,
    } = useAppQuery({
        url: isShopifyPOS() ? `/api/bve/show/${codebarre}?shopId=${shopID}` : `/api/bve/show/${codebarre}`,
    });

    const openModal = useCallback(() => setActiveModale(true), []);
    const handleCloseModale = useCallback(() => setActiveModale(false), []);
    const openDeleteModal = useCallback(() => setActiveDeleteModal(true), []);
    const handleCloseDeleteModal = useCallback(() => setActiveDeleteModal(false), []);
    const toggleActiveToast = useCallback(() => setActiveToast((active) => !active), []);

    const handleMenuClick = () => {
        const redirect = Redirect.create(app);
        redirect.dispatch(Redirect.Action.APP, `/`);
    };
    const handleBVEListClick = () => {
        const redirect = Redirect.create(app);
        redirect.dispatch(Redirect.Action.APP, `/bve/list`);
    };

    const handPdfClick = async () => {
        setIsLoadingButton(true);

        if (isShopifyPOS()) {
            const response = await fetch(`/api/bve/generateimg/${codebarre}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            
            const data = await response.json();
            
            if (data.status_code >= 200 && data.status_code < 300) {
                let imageUrls = [data.image_url]; // Initialize array with first page
                const numberOfPages = data.status_code - 200 + 1; // Calculate number of pages
            
                // Fetch remaining pages
                for (let i = 2; i <= numberOfPages; i++) {
                    const pageResponse = await fetch(`/api/bve/generateimg/${codebarre}-${i}`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    });
            
                    const pageData = await pageResponse.json();
            
                    if (pageData.status_code >= 200 && pageData.status_code < 300) {
                        imageUrls.push(pageData.image_url); // Add page to array
                    }
                }
            
                localStorage.setItem("bve_img_urls", JSON.stringify(imageUrls)); // Store array in localStorage
            
                const redirect = Redirect.create(app);
                redirect.dispatch(Redirect.Action.APP, '/bve/view/img');
            } else {
                openModal();
            }
            
        }
        else {
            const response = await fetch(`/api/bve/generatepdf/${codebarre}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();

            if (data.status === "success") {
                let hexString = data.data;
                let binaryString = hexToBinary(hexString);
                let blob = new Blob([binaryString], { type: "application/pdf" });
                let url = window.URL.createObjectURL(blob);

                let link = document.createElement("a");
                link.href = url;
                link.download = `${codebarre}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                openModal();
            }
        }

        setIsLoadingButton(false);
    };

    const handleDelete = async () => {
        setIsDeleting(true);

        try {
            const response = await fetch(
                isShopifyPOS() ? `/api/bve/delete/${codebarre}?shopId=${shopID}` : `/api/bve/delete/${codebarre}`,
                {
                    method: "GET",
                });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.status_code !== 200) {
                throw new Error(`Server error! status: ${data.status_code}`);
            }

            // Close the modal
            handleCloseDeleteModal();

            // Show success message
            setToastMessage("Le BVE a été supprimé avec succès");
            toggleActiveToast();

            // Redirect to another page after successful deletion
            const redirect = Redirect.create(app);
            redirect.dispatch(Redirect.Action.APP, `/bve/list`);
        } catch (error) {
            console.error(
                "There was a problem with the fetch operation: ",
                error
            );
            // If there's an error, stop showing the loading screen
            setIsDeleting(false);

            // Close the modal
            handleCloseDeleteModal();

            // Show error message
            setToastMessage("Une erreur est survenue lors de la suppression du BVE");
            toggleActiveToast();
        }
    };


    const responseModal = (
        <Modal
            titleHidden
            open={activeModale}
            onClose={handleCloseModale}
            instant
        >
            <Modal.Section>
                <p>
                    Une erreur est survenue lors du téléchargement du PDF de la
                    détaxe
                </p>
            </Modal.Section>
        </Modal>
    );

    const deleteModal = (
        <Modal
            open={activeDeleteModal}
            onClose={handleCloseDeleteModal}
            title="Confirmation"
            primaryAction={{
                content: 'Oui',
                onAction: handleDelete,
                destructive: true,
            }}
            secondaryActions={[
                {
                    content: 'Non',
                    onAction: handleCloseDeleteModal,
                },
            ]}

        >
            <Modal.Section>
                <TextContainer>
                    <p>Etes-vous sûr de vouloir supprimer ce BVE ?</p>
                </TextContainer>
            </Modal.Section>
        </Modal>
    );


    if (isloading_bve) {
        return (
            <div style={{ padding: "20px" }}>
                <SkeletonBodyText lines={7} />
            </div>
        );
    }

    if (isDeleting) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
            }}>
                <Spinner size="large" color="#F57C33" accessibilityLabel="Spinner example" />
                <p>Suppression en cours...</p>
            </div>
        );
    }


    return (
        <Frame>
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
            <div style={{ padding: "20px" }}>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "20px 0px 20px 0px",
                    }}
                >
                    <Button
                        icon={PrintMajor}
                        onClick={() => handPdfClick()}
                        primary={true}
                        loading={isLoadingButton}
                    >
                        {isShopifyPOS() ? "Aperçu du PDF de la détaxe" : "Télécharger le PDF de la détaxe"}
                    </Button>
                    {(bve.Douanes == 0) && (
                        <Button
                            icon={DeleteMajor}
                            onClick={openDeleteModal}
                            destructive={true}
                        >
                            Supprimer
                        </Button>
                    )}
                </div>

                <Card title="Détails du BVE">
                    <Card.Section>
                        <Layout>
                            <Layout.Section>
                                {responseModal}
                                {deleteModal}

                                <Stack vertical>
                                    <Text>CodeBarre: {bve.CodeBarre}</Text>
                                    <Text>Facture: {bve.Facture}</Text>
                                    <Text>
                                        AchatLe: {formatDate(bve.AchatLe)}
                                    </Text>
                                    <Text>Nom: {bve.Nom}</Text>
                                    <Text>Prénom: {bve.Prenom}</Text>
                                    <Text>Adresse: {bve.Adresse}</Text>
                                    <Text>Pays: {bve.Pays}</Text>
                                    <Text>Passeport: {bve.Passeport}</Text>
                                    <Text>
                                        PassportValid: {bve.PassportValid}
                                    </Text>
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
            </div>
            {activeToast && <Toast content={toastMessage} onDismiss={toggleActiveToast} />}
        </Frame>
    );
}
