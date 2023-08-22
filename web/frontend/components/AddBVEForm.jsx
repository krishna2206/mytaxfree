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
    Banner,
} from "@shopify/polaris";
import { SendMajor, PrintMajor } from "@shopify/polaris-icons";

import { useAppQuery, useAuthenticatedFetch } from "../hooks";
import { useEffect, useState, useCallback } from "react";

import DatePickerSelect from "./custom/DatePickerSelect";

// a function that from this date string DD-MM-YYYY, remove the dashes and return YYYYMMDD
function formatDateFromDashes(date) {
    let year = date.split("-")[2];
    let month = date.split("-")[1];
    let day = date.split("-")[0];
    let formattedDate = `${year}${month}${day}`;

    return formattedDate;
}

export default function AddBVEForm({ selectedOrder, orderDetail, passport }) {
    const fetch = useAuthenticatedFetch();

    // const [isLoadingPDFButton, setIsLoadingPDFButton] = useState(false);

    // Remplissage du select de la liste des pays
    const { data: countries, status: countriesStatus } = useAppQuery({
        url: "/api/countries",
    });

    let countriesOptions = [{ label: "---", value: "" }];
    let nationalityOptions = [{ label: "---", value: "" }];

    const [selectedCountry, setSelectedCountry] = useState("");
    const handleCountryChange = (value) => {
        if (!passport) {
            setSelectedCountry(value);
            setFormState({ ...formState, IDPays: value });
        }
    };
    const [selectedNationality, setSelectedNationality] = useState("");
    const handleNationalityChange = (value) => {
        if (!passport) { 
            setSelectedNationality(value);
            setFormState({ ...formState, Nationalite: value });
        }
    };

    if (countriesStatus === "success") {
        countries.Pays.forEach((country) => {
            countriesOptions.push({
                label: country.NomPays,
                value: country.IDPays,
            });

            if (country.Nationalite === "vrai") {
                nationalityOptions.push({
                    label: country.NomPays,
                    value: country.IDPays,
                });
            }
        });
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

    const [selectedDateAchat, setSelectedDateAchat] = useState("");
    const [selectedDateValiditePasseport, setSelectedDateValiditePasseport] =
        useState("");
    const [selectedDateNaissance, setSelectedDateNaissance] = useState("");
    const [selectedDateDepart, setSelectedDateDepart] = useState("");

    useEffect(() => {
        setFormState((prevState) => ({
            ...prevState,
            AchatLe: formatDateFromDashes(selectedDateAchat),
        }));
    }, [selectedDateAchat]);

    useEffect(() => {
        setFormState((prevState) => ({
            ...prevState,
            PassportValid: formatDateFromDashes(selectedDateValiditePasseport),
        }));
    }, [selectedDateValiditePasseport]);

    useEffect(() => {
        setFormState((prevState) => ({
            ...prevState,
            DateN: formatDateFromDashes(selectedDateNaissance),
        }));
    }, [selectedDateNaissance]);

    const [selected, setSelected] = useState("ReglCash");
    const handleChoiceListChange = useCallback((value) => {
        setSelected(value);
    }, []);

    const [formState, setFormState] = useState({
        Facture: orderDetail.id,
        exCodeBarre: "",
        AchatLe: formatDateFromDashes(selectedDateAchat),
        Nom: passport
            ? passport.Nom
            : orderDetail
            ? orderDetail.customer
                ? orderDetail.customer.first_name
                : ""
            : "",
        Prenom: passport
            ? passport.Prenom
            : orderDetail
            ? orderDetail.customer
                ? orderDetail.customer.last_name
                : ""
            : "",
        Addresse: passport
            ? passport.Adresse
                ? passport.Adresse
                : ""
            : orderDetail
            ? orderDetail.customer
                ? orderDetail.customer.default_address
                    ? orderDetail.customer.default_address.name
                    : ""
                : ""
            : "",
        IDPays: passport ? passport.Pays : selectedCountry,
        Passeport: passport ? passport.Passeport : "",
        PassportValid: passport
            ? passport.ValiditePasseport
            : formatDateFromDashes(selectedDateValiditePasseport),
        Nationalite: passport ? passport.Nationalite : selectedNationality,
        DateN: passport
            ? passport.DateNaissance
            : formatDateFromDashes(selectedDateNaissance),
        Messagerie: "",
        ReglCarte: selected.includes("ReglCarte") ? "1" : "0",
        ReglCheq: selected.includes("ReglCheq") ? "1" : "0",
        ReglCash: selected.includes("ReglCash") ? "1" : "0",
        ReglAutre: selected.includes("ReglAutre") ? "1" : "0",
        IDMode: selectedRefundMode,
        Compte: "",
        Beneficiaire: "",
        Mobile: "",
        VolLe: formatDateFromDashes(selectedDateDepart),
        Articles: orderDetail
            ? orderDetail.line_items.map((item) => {
                  return {
                      Code: item.id,
                      Description: item.name,
                      Identification: "",
                      PU: parseFloat(item.price),
                      PTTC: parseFloat(item.price) * 1.2 * item.quantity,
                      QTT: item.quantity,
                      TTVA: 20,
                      PTVA: parseFloat(item.price) * 0.2 * item.quantity,
                  };
              })
            : [],
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
    const [Facture, setFacture] = useState(orderDetail.id);
    const handleFactureChange = (value) => {
        setFacture(value);
        setFormState({ ...formState, Facture: value });
    };

    const [Nom, setNom] = useState(
        passport
            ? passport.Nom
            : orderDetail
            ? orderDetail.customer
                ? orderDetail.customer.first_name
                : ""
            : ""
    );
    const handleNomChange = (value) => {
        if (!passport) {
            setNom(value);
            setFormState({ ...formState, Nom: value });
        }
    };

    const [Prenom, setPrenom] = useState(
        passport
            ? passport.Prenom
            : orderDetail
            ? orderDetail.customer
                ? orderDetail.customer.last_name
                : ""
            : ""
    );
    const handlePrenomChange = (value) => {
        if (!passport) {
            setPrenom(value);
            setFormState({ ...formState, Prenom: value });
        }
    };

    const [Addresse, setAddresse] = useState(
        passport
            ? passport.Adresse
                ? passport.Adresse
                : ""
            : orderDetail
            ? orderDetail.customer
                ? orderDetail.customer.default_address
                    ? orderDetail.customer.default_address.name
                    : ""
                : ""
            : ""
    );
    const handleAddresseChange = (value) => {
        if (!passport) {
            setAddresse(value);
            setFormState({ ...formState, Addresse: value });
        }
    };

    const [Passeport, setPasseport] = useState(
        passport ? passport.Passeport : ""
    );
    const handlePasseportChange = (value) => {
        if (!passport) {
            setPasseport(value);
            setFormState({ ...formState, Passeport: value });
        }
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

    const [isButtonLoading, setIsButtonLoading] = useState(false);

    // Modals après soumission du formulaire
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [successData, setSuccessData] = useState(null);

    const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
    const [errorData, setErrorData] = useState(null);

    const [codeBarre, setCodeBarre] = useState("");

    // Fonction de soumission du formulaire
    const submitForm = async () => {
        setIsButtonLoading(true);

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
                setCodeBarre(responseData);
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

        setIsButtonLoading(false);
    };

    // Gestion de l'appui sur le bouton de soumission du formulaire
    const handleSubmit = async () => {
        const fields = [
            "Facture",
            // "exCodeBarre",
            "Nom",
            "Prenom",
            // "Addresse",
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

        // Debogage
        console.log(JSON.stringify(formState, null, 4));

        // Si le formulaire ne contient pas d'erreurs, on le soumet
        if (Object.keys(newErrors).length === 0) {
            // Verify if the dates are not empty and valid (expected : YYYYMMDD), the date can be also undefinedundefinedundefined
            if (
                selectedDateAchat &&
                selectedDateAchat.length === 10 &&
                selectedDateValiditePasseport &&
                selectedDateValiditePasseport.length === 10 &&
                selectedDateNaissance &&
                selectedDateNaissance.length === 10 &&
                selectedDateDepart &&
                selectedDateDepart.length === 10
            ) {
                // Remove the banner
                const errorBlock = document.getElementById("errorBlock");
                errorBlock.hidden = true;

                submitForm();
            } else {
                // Show a banner in the error block
                const errorBlock = document.getElementById("errorBlock");
                errorBlock.hidden = false;
                document.getElementById("errorBlockContent").innerHTML =
                    "Veuillez remplir les dates correctement";
            }
        }
    };

    const hexToBinary = (hexString) => {
        hexString = hexString.replace(/[\r\n]+/gm, "");
        hexString = hexString.replace(/\s+/g, '');
        if (hexString.length % 2 !== 0 || hexString.match(/[0-9A-Fa-f]{1,2}/g).length !== hexString.length / 2) {
            throw new Error(`${hexString} is not a valid hex string.`);
        }

        const binary = new Uint8Array(hexString.length / 2);
        for (let i = 0; i < hexString.length; i += 2) {
            binary[i/2] = parseInt(hexString.substr(i, 2), 16);
        }
        return binary;
    }

    const handPdfClick = async () => {
        // setIsLoadingPDFButton(true);

        const response = await fetch(`/api/bve/generatepdf/${codeBarre}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        });

        const data = await response.json();

        if (data.status === "success") {
            let hexString = data.data;
            let binaryString = hexToBinary(hexString);
            let blob = new Blob([binaryString], {type: 'application/pdf'});
            let url = window.URL.createObjectURL(blob);

            let link = document.createElement('a');
            link.href = url;
            link.download = `${codeBarre}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        // setIsLoadingPDFButton(false);
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

                        <Text variant="headingLg" as="h5">
                            Date d'achat
                        </Text>
                        <DatePickerSelect
                            selectedDate={selectedDateAchat}
                            setSelectedDate={setSelectedDateAchat}
                        />
                        <Text>
                            <strong>Date sélectionné :</strong> {selectedDateAchat}
                        </Text>

                        <Text variant="headingXl" as="h4">
                            Information sur l'acheteur
                        </Text>

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

                        <Select
                            label="Nationalité"
                            options={nationalityOptions}
                            onChange={handleNationalityChange}
                            value={selectedNationality}
                        />

                        <TextField
                            label="Passeport"
                            placeholder="Passeport"
                            name="Passeport"
                            value={Passeport}
                            error={errors.Passeport}
                            onChange={handlePasseportChange}
                        />

                        <Text variant="headingLg" as="h5">
                            Validité de passeport
                        </Text>
                        <DatePickerSelect
                            selectedDate={selectedDateValiditePasseport}
                            setSelectedDate={setSelectedDateValiditePasseport}
                        />
                        <Text>
                            <strong>Date sélectionné :</strong>{" "}
                            {selectedDateValiditePasseport}
                        </Text>

                        <Text variant="headingLg" as="h5">
                            Date de naissance
                        </Text>
                        <DatePickerSelect
                            selectedDate={selectedDateNaissance}
                            setSelectedDate={setSelectedDateNaissance}
                        />
                        <Text>
                            <strong>Date sélectionné :</strong>{" "}
                            {selectedDateNaissance}
                        </Text>

                        <TextField
                            label="Messagerie"
                            placeholder="Messagerie"
                            name="Messagerie"
                            value={Messagerie}
                            error={errors.Messagerie}
                            onChange={handleMessagerieChange}
                        />

                        <Text variant="headingXl" as="h4">
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

                        <Text variant="headingLg" as="h5">
                            Date de départ
                        </Text>
                        <DatePickerSelect
                            selectedDate={selectedDateDepart}
                            setSelectedDate={setSelectedDateDepart}
                        />
                        <Text>
                            <strong>Date sélectionné :</strong> {selectedDateDepart}
                        </Text>

                        <Text variant="headingXl" as="h4">
                            Liste des articles
                        </Text>
                        <ResourceList
                            resourceName={{
                                singular: "article",
                                plural: "articles",
                            }}
                            items={orderDetail.line_items.map((item) => {
                                return {
                                    id: item.id,
                                    name: item.name,
                                    price: item.price,
                                    quantity: item.quantity,
                                };
                            })}
                            renderItem={(item) => {
                                const { id, name, price, quantity } = item;
                                const media = (
                                    <Thumbnail source="https://cdn3d.iconscout.com/3d/premium/thumb/product-5806313-4863042.png" />
                                );
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

                        <div id="errorBlock" hidden>
                            <Banner status="critical">
                                <p id="errorBlockContent"></p>
                            </Banner>
                        </div>

                        <Button
                            submit
                            icon={SendMajor}
                            loading={isButtonLoading}
                            primary={true}
                        >
                            Générer la détaxe
                        </Button>
                    </VerticalStack>
                </Form>

                {/* Succès */}
                <Modal
                    open={isSuccessModalOpen}
                    onClose={() => setIsSuccessModalOpen(false)}
                    title="Ajout BVE réussi"
                    primaryAction={{
                        // loading: {isLoadingPDFButton},
                        icon: PrintMajor,
                        content: "Télécharger le PDF de la détaxe",
                        onAction: () => handPdfClick(),
                    }}
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

