import React, { useState, useCallback, useEffect, useContext } from "react";
import { useAppQuery, useAuthenticatedFetch } from "../../../hooks";
import { Context, TitleBar } from "@shopify/app-bridge-react";

import { useParams } from "react-router-dom";

import EditBVEForm from "../../../components/EditBVEForm";
import { SkeletonBodyText } from "@shopify/polaris";
import { Redirect } from "@shopify/app-bridge/actions";

export default function BVEPage() {
    const { codebarre } = useParams();

    const { data: BveInfo, status: BveInfoStatus } = useAppQuery({
        url: `/api/bve/show/${codebarre}`,
    });

    const app = useContext(Context);
    const handleBVEListClick = () => {
        const redirect = Redirect.create(app);
        redirect.dispatch(Redirect.Action.APP, `/bve-list`);
    };

    return (
        <>
            <TitleBar
                title={`Modification du BVE N°${codebarre}`}
                primaryAction={{
                    content: "Retour à la liste des BVE",
                    onAction: () => handleBVEListClick(),
                }}
            />
            <div style={{ padding: "20px" }}>
                {!BveInfo && <SkeletonBodyText lines={5} />}
                {BveInfo && BveInfoStatus === "success" && (
                    <EditBVEForm BVEInfo={BveInfo} />
                )}
                {/* {JSON.stringify(BveInfo, null, 4)} */}
            </div>
        </>
    );
}
