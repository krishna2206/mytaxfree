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

import React, { useCallback, useContext, useState } from "react";

import { Redirect } from "@shopify/app-bridge/actions";
import { Context, TitleBar } from "@shopify/app-bridge-react";
import { BarcodeMajor } from "@shopify/polaris-icons";
import { useAuthenticatedFetch } from "@shopify/app-bridge-react";

import SpacingBackground from "../../../components/SpacingBackground";

export default function ScanPassport() {
    const fetch = useAuthenticatedFetch();

    const [files, setFiles] = useState([]);
    const [rejectedFiles, setRejectedFiles] = useState([]);
    const hasError = rejectedFiles.length > 0;

    const handleDrop = useCallback(
        (_droppedFiles, acceptedFiles, rejectedFiles) => {
            if (acceptedFiles.length > 0) {
                setFiles([acceptedFiles[0]]);
            }
            setRejectedFiles(rejectedFiles);
        },
        []
    );

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
        <Banner
            title="The following images couldn't be uploaded:"
            status="critical"
        >
            <List type="bullet">
                {rejectedFiles.map((file, index) => (
                    <List.Item key={index}>
                        {`"${file.name}" is not supported. File type must be .gif, .jpg, .png or .svg.`}
                    </List.Item>
                ))}
            </List>
        </Banner>
    );

    const app = useContext(Context);
    const handleMainMenuClick = () => {
        const redirect = Redirect.create(app);
        redirect.dispatch(Redirect.Action.APP, `/`);
    };

    const handleBveCreationMenuClick = () => {
        const redirect = Redirect.create(app);
        redirect.dispatch(Redirect.Action.APP, `/bve/create`);
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState("");
    const [scanStatus, setScanStatus] = useState(null);

    const handleFromPassportClick = () => {
        const redirect = Redirect.create(app);
        redirect.dispatch(Redirect.Action.APP, `/bve/create/from-passport`);
    };

    const handleFromOrdersClick = () => {
        const redirect = Redirect.create(app);
        redirect.dispatch(Redirect.Action.APP, `/bve/create/from-orders`);
    };

    const [isLoading, setIsLoading] = useState(false);
    const handleUpload = () => {
        if (files.length > 0) {
            setIsLoading(true);

            const formData = new FormData();
            formData.append("file", files[0]);

            fetch("/api/passport/scan", {
                method: "POST",
                body: formData,
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
                        setScanStatus("error");
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
                        setScanStatus("error");
                        setModalContent("Passeport invalide ou illisible");

                        localStorage.setItem("passport", null);
                    } else {
                        setScanStatus("success");
                        setModalContent(JSON.stringify(response_data, null, 4));

                        // ? Save passport data in localStorage to get in the form
                        localStorage.setItem("passport", JSON.stringify(response_data));
                    }

                    setIsModalOpen(true);
                    setIsLoading(false);
                })
                .catch((error) => {
                    setModalContent("Error: " + error);
                    setIsModalOpen(true);
                    setIsLoading(false);

                    localStorage.setItem("passport", null);
                });
        } else {
            console.log("No file selected");
        }
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
                onClose={() => setIsModalOpen(false)}
                title="Résultat du scan"
                primaryAction={{
                    content:
                        scanStatus === "success"
                            ? "Basculer vers le formulaire de création"
                            : "Remplir le formulaire manuellement",
                    onAction:
                        scanStatus === "success"
                            ? handleFromPassportClick
                            : handleFromOrdersClick,
                }}
                secondaryActions={[
                    {
                        content: "Fermer",
                        onAction: () => setIsModalOpen(false),
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
