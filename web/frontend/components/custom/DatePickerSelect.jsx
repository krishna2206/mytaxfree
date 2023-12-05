import React, { useState, useCallback } from "react";
import { Select, HorizontalGrid } from "@shopify/polaris";

export default function DatePickerSelect({ selectedDate, setSelectedDate }) {
    // Selection jour
    const [selectedDay, setSelectedDay] = useState("");
    const handleDayChange = useCallback((value) => {
        setSelectedDay(value);
        setSelectedDate(
            (prevDate) =>
                `${value}-${prevDate.split("-")[1]}-${prevDate.split("-")[2]}`
        );
    }, []);

    const [dayOptions, setDayOptions] = useState([{ label: "---", value: "" }]);

    // Selection Mois
    const [selectedMonth, setSelectedMonth] = useState("");
    const handleMonthChange = useCallback((value) => {
        setSelectedMonth(value);
        let newDayOptions = [{ label: "---", value: "" }];
        if (parseInt(value) === 2) {
            for (let i = 1; i <= 28; i++) {
                newDayOptions.push({
                    label: `${i}`,
                    value: `${i >= 10 ? i : `0${i}`}`,
                });
            }
        } else if (
            parseInt(value) === 1 ||
            parseInt(value) === 3 ||
            parseInt(value) === 5 ||
            parseInt(value) === 7 ||
            parseInt(value) === 8 ||
            parseInt(value) === 10 ||
            parseInt(value) === 12
        ) {
            for (let i = 1; i <= 31; i++) {
                newDayOptions.push({
                    label: `${i}`,
                    value: `${i >= 10 ? i : `0${i}`}`,
                });
            }
        } else {
            for (let i = 1; i <= 30; i++) {
                newDayOptions.push({
                    label: `${i}`,
                    value: `${i >= 10 ? i : `0${i}`}`,
                });
            }
        }
        setDayOptions(newDayOptions);
        setSelectedDate(
            (prevDate) =>
                `${prevDate.split("-")[0]}-${value}-${prevDate.split("-")[2]}`
        );
    }, []);

    let monthOptions = [{ label: "---", value: "" }];
    const monthNames = [
        "Janvier",
        "Février",
        "Mars",
        "Avril",
        "Mai",
        "Juin",
        "Juillet",
        "Août",
        "Septembre",
        "Octobre",
        "Novembre",
        "Décembre",
    ];
    for (let i = 0; i < 12; i++) {
        monthOptions.push({
            label: monthNames[i],
            value: `${i + 1 >= 10 ? i + 1 : `0${i + 1}`}`,
        });
    }

    // Selection annee
    const [selectedYear, setSelectedYear] = useState("");
    const handleYearChange = useCallback((value) => {
        setSelectedYear(value);
        setSelectedDate(
            (prevDate) =>
                `${prevDate.split("-")[0]}-${prevDate.split("-")[1]}-${value}`
        );
    }, []);
    let yearOptions = [{ label: "---", value: "" }];
    for (let i = new Date().getFullYear(); i >= 1950; i--) {
        yearOptions.push({ label: `${i}`, value: `${i}` });
    }

    return (
        <HorizontalGrid gap="4" columns={3}>
            <Select
                label="Jour"
                options={dayOptions}
                onChange={handleDayChange}
                value={selectedDay}
            />
            <Select
                label="Mois"
                options={monthOptions}
                onChange={handleMonthChange}
                value={selectedMonth}
            />
            <Select
                label="Année"
                options={yearOptions}
                onChange={handleYearChange}
                value={selectedYear}
            />
            {/* Input hidden that holds the date from the select : DDMYYYY */}
            <input
                type="hidden"
                value={selectedDate}
            />
        </HorizontalGrid>
    );
}
