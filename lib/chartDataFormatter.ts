import { endOfWeek, startOfWeek } from "@/lib/date";
import { ProcessedData, View } from "@/store/dataSlice";

export const getNumPossibleEntries = (view: View, selectedDate: Date) => {
    switch (view) {
        case View.Daily:
            return 24;
        case View.Weekly:
            return 7;
        case View.Monthly:
            return new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
        case View.Yearly:
            return 12;
        default:
            return 0;
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

    return Object.entries(aggregatedData).map(([key, value]) => ({
        key,
        value,
    }));
};

export const formatTick = (value: string, view: View) => {
    switch (view) {
        case View.Yearly:
            return new Date(0, parseInt(value)).toLocaleString("default", {
                month: "short",
            });
        case View.Monthly:
            return `${parseInt(value) + 1}`; // Day of the month
        case View.Weekly:
            return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][parseInt(value)];
        case View.Daily:
            return `${value}:00`; // Hour of the day
        default:
            return value;
    }
};
