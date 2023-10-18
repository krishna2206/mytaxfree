import {
    IndexTable,
    LegacyCard,
    useIndexResourceState,
    Text,
    Badge,
    Link,
    Button,
    Icon,
    SkeletonBodyText,
    ButtonGroup,
} from "@shopify/polaris";
import { ViewMajor, EditMajor } from "@shopify/polaris-icons";

import React, { useContext } from "react";
import { useAppQuery, useAuthenticatedFetch } from "../hooks";
import { Context } from "@shopify/app-bridge-react";
import { Redirect } from "@shopify/app-bridge/actions";

export function BVEList() {
    const fetch = useAuthenticatedFetch();

    const { data, isLoading, isError, error } = useAppQuery({
        url: "/api/bve/show",
        reactQueryOptions: {
            select: (data) => {
                // console.log(data);

                const bves = data.map((item) => {
                    const { CodeBarre, Nom, AchatLe, MTTC, Douanes } = item;
                    return { CodeBarre, Nom, AchatLe, MTTC, Douanes };
                });
                return bves;
            },
        },
    });

    const resourceName = {
        singular: "bve",
        plural: "bves",
    };

    const { selectedResources, allResourcesSelected, handleSelectionChange } =
        useIndexResourceState(data);

    const app = useContext(Context)

    const handleViewClick = (CodeBarre) => {
        const redirect = Redirect.create(app);
        redirect.dispatch(Redirect.Action.APP, `/bve/view/${CodeBarre}`);
    };

    const handleModifyClick = (CodeBarre) => {
        const redirect = Redirect.create(app);
        redirect.dispatch(Redirect.Action.APP, `/bve/edit/${CodeBarre}`);
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
                        {Douanes === 0 && (
                            <Button
                            icon={EditMajor}
                            onClick={() => handleModifyClick(CodeBarre)}>
                            &nbsp;
                            Modifier
                        </Button>
                        )}
                    </ButtonGroup>
                </IndexTable.Cell>
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
        <>
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
        </>
    );
}
