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
} from "@shopify/polaris";

import { useAppQuery } from "../hooks";
import { useEffect, useState, useCallback } from "react";

import DatePickerPattern from "./custom/DatePickerPattern";

function formatDate(date) {
    let year = date.getFullYear();
    let month = (date.getMonth() + 1).toString().padStart(2, "0");
    let day = date.getDate().toString().padStart(2, "0");
    let formattedDate = `${year}${month}${day}`;

    return formattedDate;
}

export default function AddBVEForm() {
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
    }

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
    }

    // Gestions des champs du formulaire
    const [dateAchat, setDateAchat] = useState(formatDate(new Date()));
    const handleDateAchatChange = (selectedDate) => {
        setDateAchat(formatDate(selectedDate));
        setFormState({ ...formState, AchatLe: formatDate(selectedDate) });
    };
    const [dateValiditePasseport, setDateValiditePasseport] = useState(
        formatDate(new Date())
    );
    const handleDateValiditePasseportChange = (selectedDate) => {
        setDateValiditePasseport(formatDate(selectedDate));
        setFormState({
            ...formState,
            PassportValid: formatDate(selectedDate),
        });
    };
    const [dateNaissance, setDateNaissance] = useState(formatDate(new Date("Sat Jan 01 2000 03:00:00 GMT+0300 (heure d'été d'Europe de l'Est)")));
    const handleDateNaissanceChange = (selectedDate) => {
        console.log(selectedDate);
        setDateNaissance(formatDate(selectedDate));
        setFormState({
            ...formState,
            DateN: formatDate(selectedDate),
        });
    };
    const [dateDepart, setDateDepart] = useState(formatDate(new Date()));
    const handleDateDepartChange = (selectedDate) => {
        setDateDepart(formatDate(selectedDate));
        setFormState({
            ...formState,
            DateDepart: formatDate(selectedDate),
        });
    };

    const [selected, setSelected] = useState("ReglCarte");
    const handleChoiceListChange = useCallback((value) => {
        setSelected(value);
    }, []);

    const [formState, setFormState] = useState({
        Facture: "",
        exCodeBarre: "",
        AchatLe: dateAchat,
        Nom: "",
        Prenom: "",
        Addresse: "",
        IDPays: selectedCountry,
        Passeport: "",
        PassportValid: dateValiditePasseport,
        Nationalite: selectedCountry,
        DateN: dateNaissance,
        Messagerie: "",
        ReglCarte: selected.includes("ReglCarte") ? "1" : "0",
        ReglCheq: selected.includes("ReglCheq") ? "1" : "0",
        ReglCash: selected.includes("ReglCash") ? "1" : "0",
        ReglAutre: selected.includes("ReglAutre") ? "1" : "0",
        IDMode: selectedRefundMode,
        Compte: "",
        Beneficiaire: "",
        Mobile: "",
        DateDepart: dateDepart,
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
    const [Facture, setFacture] = useState("");
    const handleFactureChange = (value) => {
        setFacture(value);
        setFormState({ ...formState, Facture: value });
    };

    const [exCodeBarre, setExCodeBarre] = useState("");
    const handleExCodeBarreChange = (value) => {
        setExCodeBarre(value);
        setFormState({ ...formState, exCodeBarre: value });
    };

    const [Nom, setNom] = useState("");
    const handleNomChange = (value) => {
        setNom(value);
        setFormState({ ...formState, Nom: value });
    };

    const [Prenom, setPrenom] = useState("");
    const handlePrenomChange = (value) => {
        setPrenom(value);
        setFormState({ ...formState, Prenom: value });
    };

    const [Addresse, setAddresse] = useState("");
    const handleAddresseChange = (value) => {
        setAddresse(value);
        setFormState({ ...formState, Addresse: value });
    };

    const [Passeport, setPasseport] = useState("");
    const handlePasseportChange = (value) => {
        setPasseport(value);
        setFormState({ ...formState, Passeport: value });
    };

    const [Messagerie, setMessagerie] = useState("");
    const handleMessagerieChange = (value) => {
        setMessagerie(value);
        setFormState({ ...formState, Messagerie: value });
    };

    const [Compte, setCompte] = useState("");
    const handleCompteChange = (value) => {
        setCompte(value);
        setFormState({ ...formState, Compte: value });
    };

    const [Beneficiaire, setBeneficiaire] = useState("");
    const handleBeneficiaireChange = (value) => {
        setBeneficiaire(value);
        setFormState({ ...formState, Beneficiaire: value });
    };

    const [Mobile, setMobile] = useState("");
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
            setSuccessData("Code barre obtenu : " + responseData);
            setIsSuccessModalOpen(true);
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
            // "exCodeBarre",
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

        console.log(formState);

        // Si le formulaire ne contient pas d'erreurs, on le soumet
        if (Object.keys(newErrors).length === 0) {
            submitForm();
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
                    <TextField
                        label="Ex Code Barre"
                        placeholder="exCodeBarre"
                        name="exCodeBarre"
                        value={exCodeBarre}
                        error={errors.exCodeBarre}
                        onChange={handleExCodeBarreChange}
                    />
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
                        Payment method
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

                    <Button submit primary={true}>
                        Valider
                    </Button>
                </VerticalStack>
            </Form>

            {/* Succès */}
            <Modal
                open={isSuccessModalOpen}
                onClose={() => setIsSuccessModalOpen(false)}
                title="Ajout BVE réussi"
            >
                <Modal.Section>
                    <TextContainer>
                        <p dangerouslySetInnerHTML={{ __html: successData }}></p>
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
