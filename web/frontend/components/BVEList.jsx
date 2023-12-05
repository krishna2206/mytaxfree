import React, { useContext, useEffect, useState } from "react";
import {
    IndexTable,
    LegacyCard,
    useIndexResourceState,
    Text,
    Button,
    ButtonGroup,
    SkeletonBodyText,
} from "@shopify/polaris";
import { ViewMajor } from "@shopify/polaris-icons";

import { Context, useAuthenticatedFetch } from "@shopify/app-bridge-react";
import { Redirect } from "@shopify/app-bridge/actions";
import { isShopifyPOS } from "@shopify/app-bridge/utilities";

import { MyTaxFreeContext } from "./providers/MyTaxFreeProvider";

export function BVEList() {
    const fetch = useAuthenticatedFetch();
    const app = useContext(Context)
    const { shopID } = useContext(MyTaxFreeContext);

    const [screenWidth, setScreenWidth] = useState(window.innerWidth);
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [error, setError] = useState(null);
    const { selectedResources, handleSelectionChange } = useIndexResourceState(data);

    const resourceName = {
        singular: "bve",
        plural: "bves",
    };

    useEffect(() => {
        const handleResize = () => setScreenWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        setIsLoading(true);
        setIsError(false);

        const url = isShopifyPOS() ? `/api/bve/show?shopId=${shopID}` : "/api/bve/show";

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                const BVEList = data.map((item) => {
                    const { CodeBarre, Nom, AchatLe, MTTC, Douanes } = item;
                    return { CodeBarre, Nom, AchatLe, MTTC, Douanes };
                });
                setData(BVEList);
                setIsLoading(false);
            })
            .catch(error => {
                setIsError(true);
                setError(error);
                setIsLoading(false);
            });
    }, []);

    const handleViewClick = (CodeBarre) => {
        const redirect = Redirect.create(app);
        redirect.dispatch(Redirect.Action.APP, `/bve/view/${CodeBarre}`);
    };

    const rowMarkup = data?.map(
        ({ CodeBarre, Nom, AchatLe, MTTC, Douanes }, index) => (
            <IndexTable.Row
                id={CodeBarre}
                key={CodeBarre}
                selected={selectedResources.includes(CodeBarre)}
                position={index}
            >
                <IndexTable.Cell>{CodeBarre}</IndexTable.Cell>
                <IndexTable.Cell>{Nom}</IndexTable.Cell>
                <IndexTable.Cell>{AchatLe}</IndexTable.Cell>
                <IndexTable.Cell>{MTTC}</IndexTable.Cell>
                <IndexTable.Cell>{Douanes}</IndexTable.Cell>
                <IndexTable.Cell>
                    <ButtonGroup>
                        <Button
                            icon={ViewMajor}
                            onClick={() => handleViewClick(CodeBarre)}>
                            &nbsp;
                            Voir
                        </Button>
                    </ButtonGroup>
                </IndexTable.Cell>
            </IndexTable.Row>
        )
    );

    const mobileRowMarkup = data?.map(
        ({ CodeBarre, Nom, AchatLe, MTTC, Douanes }, index) => (
            <IndexTable.Row
                id={CodeBarre}
                key={CodeBarre}
                selected={selectedResources.includes(CodeBarre)}
                position={index}
            >
                <IndexTable.Cell>
                    <ButtonGroup>
                        <Button
                            icon={ViewMajor}
                            onClick={() => handleViewClick(CodeBarre)}>
                            &nbsp;
                            Voir
                        </Button>
                    </ButtonGroup>
                </IndexTable.Cell>
                <IndexTable.Cell>{CodeBarre}</IndexTable.Cell>
                <IndexTable.Cell>{Nom}</IndexTable.Cell>
                <IndexTable.Cell>{AchatLe}</IndexTable.Cell>
                <IndexTable.Cell>{MTTC}</IndexTable.Cell>
                <IndexTable.Cell>{Douanes}</IndexTable.Cell>
            </IndexTable.Row>
        )
    );

    if (isLoading) {
        return (
            <>
                <LegacyCard>
                    <SkeletonBodyText lines={5} />
                </LegacyCard>
            </>
        );
    }

    if (isError) {
        return (
            <LegacyCard>
                <Text>{error.message}</Text>
            </LegacyCard>
        );
    }

    return (
        screenWidth < 900 ? (
            <LegacyCard>
                <IndexTable
                    selectable={false}
                    resourceName={resourceName}
                    itemCount={data?.length}
                    headings={[
                        { title: "Action" },
                        { title: "Code" },
                        { title: "Nom" },
                        { title: "Achat le" },
                        { title: "MTTC" },
                        { title: "Douane" },
                    ]}
                >
                    {mobileRowMarkup}
                </IndexTable>
            </LegacyCard>
        ) : (
            <LegacyCard>
                <IndexTable
                    selectable={false}
                    resourceName={resourceName}
                    itemCount={data?.length}
                    headings={[
                        { title: "Code" },
                        { title: "Nom" },
                        { title: "Achat le" },
                        { title: "MTTC" },
                        { title: "Douane" },
                        { title: "Action" },
                    ]}
                >
                    {rowMarkup}
                </IndexTable>
            </LegacyCard>
        )
    );

}
