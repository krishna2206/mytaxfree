import {
    DropZone,
    LegacyStack,
    List,
    Text,
    Thumbnail,
    Banner,
    VerticalStack,
    Button,
    Modal,
} from "@shopify/polaris";

import React, { useCallback, useContext, useEffect, useState } from "react";

import { Redirect } from "@shopify/app-bridge/actions";
import { Context, TitleBar } from "@shopify/app-bridge-react";
import { BarcodeMajor } from "@shopify/polaris-icons";
import { useAuthenticatedFetch } from "@shopify/app-bridge-react";
import { isShopifyPOS } from "@shopify/app-bridge/utilities";

import { readAndCompressImage } from 'browser-image-resizer';

import SpacingBackground from "../../../components/SpacingBackground";
import { MyTaxFreeContext } from "../../../components/providers/MyTaxFreeProvider";

export default function ScanPassport() {
    const fetch = useAuthenticatedFetch();
    const app = useContext(Context);
    const { shopID } = useContext(MyTaxFreeContext);

    const [files, setFiles] = useState([]);
    const [rejectedFiles, setRejectedFiles] = useState([]);
    const hasError = rejectedFiles.length > 0;
    const [scanAPIUrl, setScanAPIUrl] = useState("/api/passport/scan");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleDrop = useCallback((_droppedFiles, acceptedFiles, rejectedFiles) => {
        if (acceptedFiles.length > 0) {
            setFiles([acceptedFiles[0]]);
        }
        setRejectedFiles(rejectedFiles);
    }, []);

    const fileUpload = !files.length && <DropZone.FileUpload />;
    const uploadedFiles = files.length > 0 && (
        <LegacyStack vertical>
            {files.map((file, index) => (
                <LegacyStack alignment="center" key={index}>
                    <Thumbnail
                        size="small"
                        alt={file.name}
                        source={window.URL.createObjectURL(file)}
                    />
                    <div>
                        {file.name}{" "}
                        <Text variant="bodySm" as="p">
                            {file.size} octets
                        </Text>
                    </div>
                </LegacyStack>
            ))}
        </LegacyStack>
    );

    const errorMessage = hasError && (
        <Banner title="The following images couldn't be uploaded:" status="critical">
            <List type="bullet">
                {rejectedFiles.map((file, index) => (
                    <List.Item key={index}>
                        {`"${file.name}" is not supported. File type must be .gif, .jpg, .png or .svg.`}
                    </List.Item>
                ))}
            </List>
        </Banner>
    );

    const handleMainMenuClick = () => {
        const redirect = Redirect.create(app);
        redirect.dispatch(Redirect.Action.APP, `/`);
    };

    const handleBveCreationMenuClick = () => {
        const redirect = Redirect.create(app);
        redirect.dispatch(Redirect.Action.APP, `/bve/create`);
    };

    const handleFromOrdersClick = () => {
        const redirect = Redirect.create(app);
        redirect.dispatch(Redirect.Action.APP, `/bve/create/from-orders`);
    };

    const handleUpload = () => {
        if (files.length > 0) {
            setIsLoading(true);

            const config = {
                quality: 1.0,
                maxWidth: 800,
                maxHeight: 800,
                autoRotate: true,
                debug: true,
            };

            if (files[0].size <= 1024 * 1024) {
                processUpload(files[0]);
            } else {
                readAndCompressImage(files[0], config)
                    .then(compressedFile => {
                        processUpload(compressedFile);
                    })
                    .catch(err => {
                        console.log(err);
                    });
            }
        } else {
            console.log("No file selected");
        }
    };

    const processUpload = (fileToUpload) => {
        const formData = new FormData();
        formData.append("file", fileToUpload);

        const scanAPIUrl = isShopifyPOS() ? `/api/passport/scan?shopId=${shopID}` : "/api/passport/scan";
    
        fetch(scanAPIUrl, {
            method: "POST",
            body: formData,
            credentials: 'include',
        })
            .then((response) => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error("Error: " + response.status);
                }
            })
            .then((data) => {
                var response_data = data.response_data;
                var status_code = data.status_code;

                // ? Erreur
                if (status_code !== 200) {
                    setModalContent(
                        "Error: " + status_code + " - " + response_data
                    );
                    setIsModalOpen(true);
                    setIsLoading(false);
                    return;
                }

                let allNull = true;
                for (let key in response_data) {
                    if (response_data[key] !== null && response_data[key] !== "") {
                        allNull = false;
                        break;
                    }
                }

                // ? Erreur
                if (allNull) {
                    setModalContent("Passeport invalide ou illisible");
                    setIsModalOpen(true);

                    localStorage.setItem("passport", null);
                } else {
                    // ? Save passport data in localStorage to get in the form
                    // ! Does not work in incognito mode
                    localStorage.setItem("passport", JSON.stringify(response_data));

                    // ? Redirect to the form
                    const redirect = Redirect.create(app);
                    redirect.dispatch(Redirect.Action.APP, '/bve/create/from-passport');
                }

                setIsLoading(false);
            })
            .catch((error) => {
                setModalContent("Une erreur est survenue : " + error);
                setIsModalOpen(true);
                setIsLoading(false);

                // ! Does not work in incognito mode
                localStorage.setItem("passport", null);
            });
    };

    return (
        <>
            <TitleBar
                title="Scan du passeport du voyageur"
                primaryAction={{
                    content: "Retour au menu",
                    onAction: () => handleMainMenuClick(),
                }}
                secondaryActions={[
                    {
                        content: "Retour au menu de création",
                        onAction: () => handleBveCreationMenuClick(),
                    },
                ]}
            />
            <SpacingBackground>
                <VerticalStack gap="5">
                    <Text variant="headingXl" as="h4" alignment="center">
                        Veuillez placer l'image du passeport du voyageur dans le
                        cadre ci-dessous
                    </Text>
                    {errorMessage}
                    <DropZone accept="image/*" type="image" onDrop={handleDrop}>
                        {uploadedFiles}
                        {fileUpload}
                    </DropZone>
                    <Button
                        icon={BarcodeMajor}
                        onClick={handleUpload}
                        loading={isLoading}
                        primary
                    >
                        Scanner l'image
                    </Button>
                </VerticalStack>
            </SpacingBackground>

            <Modal
                open={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    localStorage.setItem("passport", null);
                }}
                title="Résultat du scan"
                primaryAction={{
                    content: "Remplir le formulaire manuellement",
                    onAction: handleFromOrdersClick,
                }}
                secondaryActions={[
                    {
                        content: "Fermer",
                        onAction: () => {
                            setIsModalOpen(false);
                            localStorage.setItem("passport", null);
                        },
                    },
                ]}
            >
                <Modal.Section>
                    <Text>{modalContent}</Text>
                </Modal.Section>
            </Modal>

        </>
    );
}
