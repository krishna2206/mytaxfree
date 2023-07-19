import React, { useState, useCallback, useEffect } from "react";
import { useParams } from "react-router-dom";
import EditBVEForm from "../../../components/EditBVEForm";

export default function BVEPage() {
    const { codebarre } = useParams();

    return (
        <>
            <TitleBar
                title={`Informations du BVE N°${codebarre}`}
                primaryAction={
                    {
                        icon: ListMajor,
                        content: 'Liste des BVE',
                        onAction: () => handleBVEListClick(),
                    }
                }
            />
        </>
    );
}
