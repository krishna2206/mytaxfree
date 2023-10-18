import { Banner, Text } from "@shopify/polaris";
import React, { useState, useCallback } from "react";

export default function TestPage() {
    const [date, setDate] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    return (
        <>
            <Text variant="headingXl" as="h4">
                Test
            </Text>
        </>
    );
}
