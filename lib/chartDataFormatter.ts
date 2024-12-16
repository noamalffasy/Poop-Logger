import { ProcessedData, View } from "@/store/dataSlice";
import { endOfWeek, startOfWeek } from "./date";

const getPossibleEntries = (view: View) => {
    switch (view) {
        case View.Daily:
            return Array.from({ length: 24 }, (_, i) => i); // Hours of the day
        case View.Weekly:
            return Array.from({ length: 7 }, (_, i) => i); // Days of the week
        case View.Monthly:
            return Array.from({ length: 31 }, (_, i) => i + 1); // Days of the month
        case View.Yearly:
            return Array.from({ length: 12 }, (_, i) => i); // Months of the year
        default:
            return [];
    }
};

export const formatData = (data: ProcessedData, view: View, selectedDate: Date) => {
    const filteredData = data.filter(entry => {
        const entryDate = new Date(entry.timestamp);

        switch (view) {
            case View.Daily:
                return entryDate.toDateString() === selectedDate.toDateString();
            case View.Weekly:
                const start = startOfWeek(selectedDate);
                const end = endOfWeek(selectedDate);
                return entryDate >= start && entryDate <= end;
            case View.Monthly:
                return (
                    entryDate.getFullYear() === selectedDate.getFullYear() &&
                    entryDate.getMonth() === selectedDate.getMonth()
                );
            case View.Yearly:
                return entryDate.getFullYear() === selectedDate.getFullYear();
            default:
                return false;
        }
    });    

    const aggregatedData = filteredData.reduce((acc, entry) => {
        const entryDate = new Date(entry.timestamp);

        let key;
        switch (view) {
            case View.Daily:
                key = entryDate.getHours();
                break;
            case View.Weekly:
                key = entryDate.getDay();
                break;
            case View.Monthly:
                key = entryDate.getDate();
                break;
            case View.Yearly:
                key = entryDate.getMonth();
                break;
            default:
                key = "";
        }
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {} as { [key: string]: number });

    const possibleEntries = getPossibleEntries(view);
    possibleEntries.forEach(entry => {
        if (!(entry in aggregatedData)) {
            aggregatedData[entry] = 0;
        }
    });

    return Object.entries(aggregatedData).map(([key, value]) => ({
        key,
        value,
    }));
};
