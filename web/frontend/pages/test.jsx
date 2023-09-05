import { Banner, Text } from "@shopify/polaris";
import React, { useState, useCallback } from "react";

import DatePickerInput from "../components/custom/DatePickerInput";

function mustBeCurrentDate(day, month, year) {
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth() + 1;
    const todayDay = today.getDate();

    if (year < todayYear || year > todayYear)
        return [false, "La date doit être la date actuelle."];
    else if (month < todayMonth || month > todayMonth)
        return [false, "La date doit être la date actuelle."];
    else if (day < todayDay || day > todayDay)
        return [false, "La date doit être la date actuelle."];
    else return [true, ""];
}

function mustBePastDate(day, month, year) {
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth() + 1;
    const todayDay = today.getDate();

    if (year > todayYear) return [false, "La date doit être dans le passé."];
    else if (year === todayYear && month > todayMonth)
        return [false, "La date doit être dans le passé."];
    else if (year === todayYear && month === todayMonth && day > todayDay)
        return [false, "La date doit être dans le passé."];
    else return [true, ""];
}

function mustBeFutureDate(day, month, year) {
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth() + 1;
    const todayDay = today.getDate();

    if (year < todayYear) return [false, "La date doit être dans le futur."];
    else if (year === todayYear && month < todayMonth)
        return [false, "La date doit être dans le futur."];
    else if (year === todayYear && month === todayMonth && day <= todayDay)
        return [false, "La date doit être dans le futur."];
    else return [true, ""];
}

export default function TestPage() {
    const [date, setDate] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    return (
        <>
            <Text variant="headingXl" as="h4">
                Test
            </Text>
            <DatePickerInput
                optionalRequirement={mustBeFutureDate}
                setErrorMessage={setErrorMessage}
                selectedDate={date}
                setSelectedDate={setDate}
            />
            <Text>{date}</Text>
            <div style={{ display: errorMessage === "" ? "none" : "block" }}>
                <Banner status="critical">{errorMessage}</Banner>
            </div>
        </>
    );
}
