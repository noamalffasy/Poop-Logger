import { Dispatch } from "redux";

import { getWeekIdentifier } from "@/lib/date";
import { Period, PeriodType, ProcessedData, setSelectedPeriod, View } from "@/store/dataSlice";

export const handleDateChange = (
    date: Date,
    data: ProcessedData | null,
    selectedView: View,
    dispatch: Dispatch
) => {
    if (date && data) {
        let newPeriod: Period;
        switch (selectedView) {
            case View.Daily:
                newPeriod = {
                    type: PeriodType.Day,
                    value: date.toDateString(),
                };
                break;
            case View.Weekly:
                newPeriod = {
                    type: PeriodType.Week,
                    value: getWeekIdentifier(date),
                };
                break;
            case View.Monthly:
                newPeriod = {
                    type: PeriodType.Month,
                    value: `${date.getFullYear()}-${String(
                        date.getMonth() + 1
                    ).padStart(2, "0")}`,
                };
                break;
            case View.Yearly:
                newPeriod = {
                    type: PeriodType.Year,
                    value: `${date.getFullYear()}`,
                };
                break;
            default:
                newPeriod = {
                    type: PeriodType.Week,
                    value: getWeekIdentifier(date),
                };
        }
        dispatch(setSelectedPeriod(newPeriod));
    }
};
