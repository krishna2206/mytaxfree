import React, { useState, useCallback } from "react";
import { HorizontalGrid, TextField } from "@shopify/polaris";

function padWithZero(value) {
    const numericValue = parseInt(value, 10);
    return numericValue < 10 ? "0" + numericValue : numericValue.toString();
}

function isValidDate(d, m, y) {
    // Check the ranges of month and year
    if (y < 1000 || y > 3000 || m < 1 || m > 12) return false;

    // Check if the day is valid for the month
    if (m === 2) {
        const isLeap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
        if (d > 29 || (d === 29 && !isLeap)) return false;
    } else if (m === 4 || m === 6 || m === 9 || m === 11) {
        if (d > 30) return false;
    } else if (d > 31) {
        return false;
    }

    return true;
}

export default function DatePickerInput({
    optionalRequirement = null,
    setErrorMessage,
    selectedDate,
    setSelectedDate,
}) {
    const [selectedDay, setSelectedDay] = useState(selectedDate.split("-")[0]);
    const [selectedMonth, setSelectedMonth] = useState(
        selectedDate.split("-")[1]
    );
    const [selectedYear, setSelectedYear] = useState(
        selectedDate.split("-")[2]
    );

    const handleDayChange = useCallback(
        (value) => {
            const numericValue = value.replace(/\D/g, "");
            setSelectedDay(numericValue);

            let errorMessage = "";
            let isValid = isValidDate(
                Number(numericValue),
                Number(selectedMonth),
                Number(selectedYear)
            );

            if (!isValid) {
                errorMessage = "Veuillez entrer une date valide.";
            } else if (optionalRequirement) {
                let optionalRequirementResult = optionalRequirement(
                    Number(numericValue),
                    Number(selectedMonth),
                    Number(selectedYear)
                );
                if (!optionalRequirementResult[0]) {
                    isValid = false;
                    errorMessage = optionalRequirementResult[1];
                }
            }

            setErrorMessage(errorMessage);

            if (isValid) {
                setSelectedDate(
                    (prevDate) =>
                        `${padWithZero(numericValue)}-${
                            prevDate.split("-")[1]
                        }-${prevDate.split("-")[2]}`
                );
            }
        },
        [selectedMonth, selectedYear]
    );


    const handleMonthChange = useCallback(
        (value) => {
            const numericValue = value.replace(/\D/g, "");
            setSelectedMonth(numericValue);

            let errorMessage = "";
            let isValid = isValidDate(
                Number(selectedDay),
                Number(numericValue),
                Number(selectedYear)
            );

            if (!isValid) {
                errorMessage = "Veuillez entrer une date valide.";
            } else if (optionalRequirement) {
                let optionalRequirementResult = optionalRequirement(
                    Number(selectedDay),
                    Number(numericValue),
                    Number(selectedYear)
                );
                if (!optionalRequirementResult[0]) {
                    isValid = false;
                    errorMessage = optionalRequirementResult[1];
                }
            }

            setErrorMessage(errorMessage);

            if (isValid) {
                setSelectedDate(
                    (prevDate) =>
                        `${prevDate.split("-")[0]}-${padWithZero(
                            numericValue
                        )}-${prevDate.split("-")[2]}`
                );
            }
        },
        [selectedDay, selectedYear]
    );

    const handleYearChange = useCallback(
        (value) => {
            const numericValue = value.replace(/\D/g, "");
            setSelectedYear(numericValue);

            let errorMessage = "";
            let isValid = isValidDate(
                Number(selectedDay),
                Number(selectedMonth),
                Number(numericValue)
            );

            if (!isValid) {
                errorMessage = "Veuillez entrer une date valide.";
            } else if (optionalRequirement) {
                let optionalRequirementResult = optionalRequirement(
                    Number(selectedDay),
                    Number(selectedMonth),
                    Number(numericValue)
                );
                if (!optionalRequirementResult[0]) {
                    isValid = false;
                    errorMessage = optionalRequirementResult[1];
                }
            }

            setErrorMessage(errorMessage);

            if (isValid) {
                setSelectedDate(
                    (prevDate) =>
                        `${prevDate.split("-")[0]}-${
                            prevDate.split("-")[1]
                        }-${numericValue}`
                );
            }
        },
        [selectedDay, selectedMonth]
    );


    return (
        <HorizontalGrid gap="4" columns={3}>
            <TextField
                label="Jour"
                onChange={handleDayChange}
                value={selectedDay}
                maxLength={2}
                placeholder="JJ"
            />
            <TextField
                label="Mois"
                onChange={handleMonthChange}
                value={selectedMonth}
                maxLength={2}
                placeholder="MM"
            />
            <TextField
                label="Année"
                onChange={handleYearChange}
                value={selectedYear}
                maxLength={4}
                placeholder="AAAA"
            />
            <input type="hidden" value={selectedDate} />
        </HorizontalGrid>
    );
}
