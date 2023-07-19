import {
    TextContainer,
    Modal,
    Select,
    ChoiceList,
    VerticalStack,
    Text,
    Form,
    TextField,
    Button,
    ResourceList,
    TextStyle,
    Thumbnail,
} from "@shopify/polaris";
import { EditMajor } from "@shopify/polaris-icons";

import { useAppQuery, useAuthenticatedFetch } from "../hooks";
import { useEffect, useState, useCallback } from "react";

import DatePickerPattern from "./custom/DatePickerPattern";

function formatDate(date) {
    let year = date.getFullYear();
    let month = (date.getMonth() + 1).toString().padStart(2, "0");
    let day = date.getDate().toString().padStart(2, "0");
    let formattedDate = `${year}${month}${day}`;

    return formattedDate;
}

export default function EditBVEForm({ BVEInfo }) {
    const fetch = useAuthenticatedFetch();

    // Remplissage du select de la liste des pays
    const { data: countries, status: countriesStatus } = useAppQuery({
        url: "/api/countries",
    });
    const [selectedCountry, setSelectedCountry] = useState("");
    const handleCountryChange = (value) => {
        setSelectedCountry(value);
        setFormState({ ...formState, IDPays: value, Nationalite: value });
    };
    let countriesOptions = [];
    if (countriesStatus === "success") {
        countriesOptions = countries.Pays.map((country) => ({
            label: country.NomPays,
            value: country.IDPays,
        }));
        // setSelectedCountry(BVEInfo.IDPays);
    }

    useEffect(() => {
        setSelectedCountry(BVEInfo.IDPays);
    }, []);

    // Remplissage du select de la liste des modes de remboursement
    const { data: refundModes, status: refundModesStatus } = useAppQuery({
        url: "/api/refund-modes",
    });
    const [selectedRefundMode, setSelectedRefundMode] = useState("");
    const handleRefundModeChange = (value) => {
        setSelectedRefundMode(value);
        setFormState({ ...formState, IDMode: value });
    };
    let refundModesOptions = [];
    if (refundModesStatus === "success") {
        refundModesOptions = refundModes.Remboursement.map((refundMode) => ({
            label: refundMode.Libelle,
            value: refundMode.Mode,
        }));
        // setSelectedRefundMode(BVEInfo.IDMode);
    }

    useEffect(() => {
        setSelectedRefundMode(BVEInfo.IDMode);
    }, []);

    // Gestions des champs du formulaire
    const [dateAchat, setDateAchat] = useState(BVEInfo.AchatLe);
    const handleDateAchatChange = (selectedDate) => {
        setDateAchat(formatDate(selectedDate));
        setFormState({ ...formState, AchatLe: formatDate(selectedDate) });
    };
    const [dateValiditePasseport, setDateValiditePasseport] = useState(
        BVEInfo.PassportValid
    );
    const handleDateValiditePasseportChange = (selectedDate) => {
        setDateValiditePasseport(formatDate(selectedDate));
        setFormState({
            ...formState,
            PassportValid: formatDate(selectedDate),
        });
    };
    const [dateNaissance, setDateNaissance] = useState(
        BVEInfo.DateNaissance
    );
    const handleDateNaissanceChange = (selectedDate) => {
        console.log(selectedDate);
        setDateNaissance(formatDate(selectedDate));
        setFormState({
            ...formState,
            DateN: formatDate(selectedDate),
        });
    };
    const [dateDepart, setDateDepart] = useState(BVEInfo.DepartLe);
    const handleDateDepartChange = (selectedDate) => {
        setDateDepart(formatDate(selectedDate));
        setFormState({
            ...formState,
            DateDepart: formatDate(selectedDate),
        });
    };

    let paymentMethod = ""
    if (BVEInfo.ReglCarte === true) {
        paymentMethod = "ReglCarte";
    } else if (BVEInfo.ReglCheq === true) {
        paymentMethod = "ReglCheq";
    } else if (BVEInfo.ReglCash === true) {
        paymentMethod = "ReglCash";
    } else if (BVEInfo.ReglAutre === true) {
        paymentMethod = "ReglAutre";
    }

    const [selected, setSelected] = useState(paymentMethod);
    const handleChoiceListChange = useCallback((value) => {
        setSelected(value);
    }, []);

    const [formState, setFormState] = useState({
        Facture: BVEInfo.Facture,
        exCodeBarre: BVEInfo.CodeBarre,
        AchatLe: BVEInfo.AchatLe,
        Nom: BVEInfo.Nom,
        Prenom: BVEInfo.Prenom,
        Addresse: BVEInfo.Addresse === "0" ? "" : BVEInfo.Addresse,
        IDPays: BVEInfo.IDPays,
        Passeport: BVEInfo.Passeport,
        PassportValid: BVEInfo.PassportValid,
        Nationalite: BVEInfo.IDPays,
        DateN: BVEInfo.DateNaissance,
        Messagerie: BVEInfo.Messagerie,
        ReglCarte: BVEInfo.ReglCarte === true ? "1" : "0",
        ReglCheq: BVEInfo.ReglCheq === true ? "1" : "0",
        ReglCash: BVEInfo.ReglCash === true ? "1" : "0",
        ReglAutre: BVEInfo.ReglAutre === true ? "1" : "0",
        IDMode: BVEInfo.IDMode,
        Compte: BVEInfo.Compte === "0" ? "" : BVEInfo.Compte,
        Beneficiaire: BVEInfo.Beneficiaire === "0" ? "" : BVEInfo.Beneficiaire,
        Mobile: BVEInfo.Mobile === "0" ? "" : BVEInfo.Mobile,
        VolLe: BVEInfo.DepartLe,
        Articles: BVEInfo ? BVEInfo.Articles.map(
            (item) => {
                return {
                    Code: item.Code,
                    Description: item.Description,
                    Identification: item.Identification,
                    PU: item.PU,
                    PTTC: item.PTTC,
                    QTT: item.QTT,
                    TTVA: item.TTVA,
                    PTVA: item.PTVA,
                };
            }) : [],
    });

    useEffect(() => {
        setFormState((prevState) => ({
            ...prevState,
            ReglCarte: selected.includes("ReglCarte") ? "1" : "0",
            ReglCheq: selected.includes("ReglCheq") ? "1" : "0",
            ReglCash: selected.includes("ReglCash") ? "1" : "0",
            ReglAutre: selected.includes("ReglAutre") ? "1" : "0",
        }));
    }, [selected]);

    useEffect(() => {
        if (countriesStatus === "success" && countries.Pays.length > 0) {
            const firstCountry = countries.Pays[0].IDPays;
            setSelectedCountry(firstCountry);
            setFormState((prevState) => ({
                ...prevState,
                IDPays: firstCountry,
                Nationalite: firstCountry,
            }));
        }
    }, [countriesStatus]);

    useEffect(() => {
        if (
            refundModesStatus === "success" &&
            refundModes.Remboursement.length > 0
        ) {
            const firstRefundMode = refundModes.Remboursement[0].Mode;
            setSelectedRefundMode(firstRefundMode);
            setFormState((prevState) => ({
                ...prevState,
                IDMode: firstRefundMode,
            }));
        }
    }, [refundModesStatus]);

    // Gestion des champs textes
    const [Facture, setFacture] = useState(BVEInfo.Facture);
    const handleFactureChange = (value) => {
        setFacture(value);
        setFormState({ ...formState, Facture: value });
    };

    const [exCodeBarre, setExCodeBarre] = useState(BVEInfo.CodeBarre);
    const handleExCodeBarreChange = (value) => {
        setExCodeBarre(value);
        setFormState({ ...formState, exCodeBarre: value });
    };

    const [Nom, setNom] = useState(BVEInfo.Nom);
    const handleNomChange = (value) => {
        setNom(value);
        setFormState({ ...formState, Nom: value });
    };

    const [Prenom, setPrenom] = useState(BVEInfo.Prenom);
    const handlePrenomChange = (value) => {
        setPrenom(value);
        setFormState({ ...formState, Prenom: value });
    };

    const [Addresse, setAddresse] = useState(BVEInfo.Addresse === "0" ? "" : BVEInfo.Addresse);
    const handleAddresseChange = (value) => {
        setAddresse(value);
        setFormState({ ...formState, Addresse: value });
    };

    const [Passeport, setPasseport] = useState(BVEInfo.Passeport);
    const handlePasseportChange = (value) => {
        setPasseport(value);
        setFormState({ ...formState, Passeport: value });
    };

    const [Messagerie, setMessagerie] = useState(BVEInfo.Messagerie);
    const handleMessagerieChange = (value) => {
        setMessagerie(value);
        setFormState({ ...formState, Messagerie: value });
    };

    const [Compte, setCompte] = useState(BVEInfo.Compte === "0" ? "" : BVEInfo.Compte);
    const handleCompteChange = (value) => {
        setCompte(value);
        setFormState({ ...formState, Compte: value });
    };

    const [Beneficiaire, setBeneficiaire] = useState(BVEInfo.Beneficiaire === "0" ? "" : BVEInfo.Beneficiaire);
    const handleBeneficiaireChange = (value) => {
        setBeneficiaire(value);
        setFormState({ ...formState, Beneficiaire: value });
    };

    const [Mobile, setMobile] = useState(BVEInfo.Mobile === "0" ? "" : BVEInfo.Mobile);
    const handleMobileChange = (value) => {
        setMobile(value);
        setFormState({ ...formState, Mobile: value });
    };

    // Gestion des erreurs
    const [errors, setErrors] = useState({
        Facture: "",
        exCodeBarre: "",
        Nom: "",
        Prenom: "",
        Addresse: "",
        Passeport: "",
        Messagerie: "",
        Compte: "",
        Beneficiaire: "",
        Mobile: "",
    });

    // Modals après soumission du formulaire
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [successData, setSuccessData] = useState(null);

    const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
    const [errorData, setErrorData] = useState(null);

    // Fonction de soumission du formulaire
    const submitForm = async () => {
        const response = await fetch("/api/barcode", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formState),
        });

        const data = await response.json();
        const responseData = data.response_data;
        const statusCode = data.status_code;

        if (statusCode === 200) {
            // Envoyer le code barre à la douane pour finaliser l'ajout du BVE
            const secondResponse = await fetch("/api/set-operation-status", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    Codebarre: responseData,
                    Status: "OK",
                }),
            });

            const secondData = await secondResponse.json();
            const secondResponseData = secondData.response_data;
            const secondStatusCode = secondData.status_code;

            if (secondStatusCode === 200) {
                setSuccessData(
                    "Code barre obtenu : " +
                        responseData +
                        ".<br />Le BVE a été ajouté avec succès.<br />" +
                        secondResponseData
                );
                setIsSuccessModalOpen(true);
            } else {
                if (secondResponseData) {
                    setErrorData(secondResponseData);
                } else {
                    setErrorData(secondData);
                }

                setIsErrorModalOpen(true);
            }
        } else {
            if (responseData) {
                setErrorData(responseData);
            } else {
                setErrorData(data);
            }

            setIsErrorModalOpen(true);
        }
    };

    // Gestion de l'appui sur le bouton de soumission du formulaire
    const handleSubmit = async () => {
        const fields = [
            "Facture",
            "exCodeBarre",
            "Nom",
            "Prenom",
            "Addresse",
            "Passeport",
            "Messagerie",
            // "Compte",
            // "Beneficiaire",
            // "Mobile",
        ];

        const newErrors = {};

        fields.forEach((field) => {
            if (!formState[field]) {
                newErrors[field] = "Ce champ est obligatoire";
            }
        });

        setErrors(newErrors);

        console.log(JSON.stringify(formState, null, 4));

        // Si le formulaire ne contient pas d'erreurs, on le soumet
        if (Object.keys(newErrors).length === 0) {
            console.log(JSON.stringify(formState, null, 4));
            // submitForm();
        }
    };

    return (
        <>
            <Form onSubmit={handleSubmit}>
                <VerticalStack gap="2">
                    <TextField
                        label="Facture"
                        placeholder="Facture"
                        name="Facture"
                        value={Facture}
                        error={errors.Facture}
                        onChange={handleFactureChange}
                    />
                    {/* <TextField
                        label="Ex Code Barre"
                        placeholder="exCodeBarre"
                        name="exCodeBarre"
                        value={exCodeBarre}
                        error={errors.exCodeBarre}
                        onChange={handleExCodeBarreChange}
                    /> */}
                    <DatePickerPattern
                        label="Date d'achat"
                        onDateChange={handleDateAchatChange}
                    />
                    <TextField
                        label="Nom"
                        placeholder="Nom"
                        name="Nom"
                        value={Nom}
                        error={errors.Nom}
                        onChange={handleNomChange}
                    />
                    <TextField
                        label="Prénom"
                        placeholder="Prénom"
                        name="Prenom"
                        value={Prenom}
                        error={errors.Prenom}
                        onChange={handlePrenomChange}
                    />
                    <TextField
                        label="Addresse"
                        placeholder="Addresse"
                        name="Addresse"
                        value={Addresse}
                        error={errors.Addresse}
                        onChange={handleAddresseChange}
                    />

                    <Select
                        label="Pays"
                        options={countriesOptions}
                        onChange={handleCountryChange}
                        value={selectedCountry}
                    />

                    <TextField
                        label="Passeport"
                        placeholder="Passeport"
                        name="Passeport"
                        value={Passeport}
                        error={errors.Passeport}
                        onChange={handlePasseportChange}
                    />

                    <DatePickerPattern
                        label="Validité de passeport"
                        onDateChange={handleDateValiditePasseportChange}
                    />

                    <DatePickerPattern
                        label="Date de naissance"
                        onDateChange={handleDateNaissanceChange}
                    />

                    <TextField
                        label="Messagerie"
                        placeholder="Messagerie"
                        name="Messagerie"
                        value={Messagerie}
                        error={errors.Messagerie}
                        onChange={handleMessagerieChange}
                    />

                    <Text variant="heading3xl" as="h2">
                        Règlement des achats en magasin
                    </Text>
                    <ChoiceList
                        choices={[
                            { label: "Par carte", value: "ReglCarte" },
                            { label: "Par chèque", value: "ReglCheq" },
                            { label: "Par cash", value: "ReglCash" },
                            { label: "Autre", value: "ReglAutre" },
                        ]}
                        selected={selected}
                        onChange={handleChoiceListChange}
                    />

                    <Select
                        label="Mode de remboursement"
                        options={refundModesOptions}
                        onChange={handleRefundModeChange}
                        value={selectedRefundMode}
                    />

                    <TextField
                        label="Compte"
                        placeholder="Compte"
                        name="Compte"
                        value={Compte}
                        error={errors.Compte}
                        onChange={handleCompteChange}
                    />

                    <TextField
                        label="Beneficiaire"
                        placeholder="Beneficiaire"
                        name="Beneficiaire"
                        value={Beneficiaire}
                        error={errors.Beneficiaire}
                        onChange={handleBeneficiaireChange}
                    />

                    <TextField
                        label="Mobile"
                        placeholder="Mobile"
                        name="Mobile"
                        value={Mobile}
                        error={errors.Mobile}
                        onChange={handleMobileChange}
                    />

                    <DatePickerPattern
                        label="Date de départ"
                        onDateChange={handleDateDepartChange}
                    />

                    <Text variant="heading3xl" as="h2">
                        Liste des articles
                    </Text>
                    <ResourceList
                        resourceName={{ singular: "article", plural: "articles" }}
                        items={
                            BVEInfo.Articles.map(
                                (item) => {
                                    return {
                                        id: item.Code,
                                        name: item.Description,
                                        price: item.PU,
                                        quantity: item.QTT,
                                    };
                                }
                            )
                        }
                        renderItem={(item) => {
                            const { id, name, price, quantity } = item;
                            const media = <Thumbnail
                                source="https://cdn3d.iconscout.com/3d/premium/thumb/product-5806313-4863042.png"
                                alt="Black choker necklace"
                            />;
                            return (
                                <ResourceList.Item
                                    id={id}
                                    media={media}
                                    accessibilityLabel={`Détails de l'article ${name}`}
                                >
                                    <h3>
                                        <TextStyle variation="strong">
                                            {name}
                                        </TextStyle>
                                    </h3>
                                    <div>
                                        {quantity} x {price} €
                                    </div>
                                </ResourceList.Item>
                            );
                        }}
                    />

                    <Button
                        submit
                        icon={EditMajor}
                        primary={true}
                    >
                        &nbsp;
                        Modifier
                    </Button>
                </VerticalStack>
            </Form>

            {/* Succès */}
            <Modal
                open={isSuccessModalOpen}
                onClose={() => setIsSuccessModalOpen(false)}
                title="Modification BVE réussi"
            >
                <Modal.Section>
                    <TextContainer>
                        <p
                            dangerouslySetInnerHTML={{ __html: successData }}
                        ></p>
                    </TextContainer>
                </Modal.Section>
            </Modal>

            {/* Erreur */}
            <Modal
                open={isErrorModalOpen}
                onClose={() => setIsErrorModalOpen(false)}
                title="Erreur"
                backdrop="static" // Add this line to disable the modal backdrop
            >
                <Modal.Section>
                    <TextContainer>
                        <p dangerouslySetInnerHTML={{ __html: errorData }}></p>
                    </TextContainer>
                </Modal.Section>
            </Modal>
        </>
    );
}
