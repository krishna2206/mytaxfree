import React, { useState, useRef, useEffect } from 'react';
import { VerticalStack, Box, Popover, TextField, Icon, Card } from '@shopify/polaris';
import { CalendarMinor } from '@shopify/polaris-icons';
import { DatePicker } from '@shopify/polaris';

const ForwardedRefCard = React.forwardRef((props, ref) => <Card {...props} ref={ref} />);

export default function DatePickerPattern(props) {
    function nodeContainsDescendant(rootNode, descendant) {
        if (rootNode === descendant) {
            return true;
        }
        let parent = descendant.parentNode;
        while (parent != null) {
            if (parent === rootNode) {
                return true;
            }
            parent = parent.parentNode;
        }
        return false;
    }

    const [visible, setVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [{ month, year }, setDate] = useState({
        month: selectedDate.getMonth(),
        year: selectedDate.getFullYear(),
    });

    const formattedValue = selectedDate.toISOString().slice(0, 10);
    const datePickerRef = useRef(null);

    function isNodeWithinPopover(node) {
        return datePickerRef?.current
            ? nodeContainsDescendant(datePickerRef.current, node)
            : false;
    }

    function handleInputValueChange() {
        console.log("handleInputValueChange");
    }

    function handleOnClose({ relatedTarget }) {
        setVisible(false);
    }

    function handleMonthChange(month, year) {
        setDate({ month, year });
    }

    function handleDateSelection({ end: newSelectedDate }) {
        const offsetInHours = newSelectedDate.getTimezoneOffset() / 60;
        newSelectedDate.setHours(newSelectedDate.getHours() - offsetInHours);
        setSelectedDate(newSelectedDate);
        setVisible(false);

        // Call the onDateChange prop if it exists
        if (props.onDateChange) {
            props.onDateChange(newSelectedDate);
        }
    }

    useEffect(() => {
        if (selectedDate) {
            setDate({
                month: selectedDate.getMonth(),
                year: selectedDate.getFullYear(),
            });
        }
    }, [selectedDate]);

    return (
        <VerticalStack inlineAlign="center" gap="4">
            <Box minWidth="276px" padding={{ xs: 2 }} style={{ width: '100%' }}>
                <Popover
                    active={visible}
                    autofocusTarget="none"
                    preferredAlignment="left"
                    fullWidth
                    preferInputActivator={false}
                    preferredPosition="below"
                    preventCloseOnChildOverlayClick
                    onClose={handleOnClose}
                    activator={
                        <TextField
                            role="combobox"
                            label={props.label}
                            prefix={<Icon source={CalendarMinor} />}
                            value={formattedValue}
                            onFocus={() => setVisible(true)}
                            onChange={handleInputValueChange}
                            autoComplete="off"
                        />
                    }
                >
                    <ForwardedRefCard ref={datePickerRef}>
                        <DatePicker
                            month={month}
                            year={year}
                            selected={selectedDate}
                            onMonthChange={handleMonthChange}
                            onChange={handleDateSelection}
                        />
                    </ForwardedRefCard>
                </Popover>
            </Box>
        </VerticalStack>
    );
}
