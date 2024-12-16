import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { getWeekIdentifier } from '@/lib/date';

interface DataState {
    data: ProcessedData | null
    selectedPeriod: Period
    selectedView: View
}

export interface ProcessedData extends Array<Entry> { }

export interface Entry {
    timestamp: number;
    // Add other properties as needed
}

export enum PeriodType {
    Day = 'day',
    Week = 'week',
    Month = 'month',
    Year = 'year'
}

export interface Period {
    type: PeriodType;
    value: string;
}

export enum View {
    Daily = 'daily',
    Weekly = 'weekly',
    Monthly = 'monthly',
    Yearly = 'yearly'
}

const initialState: DataState = {
    data: null,
    selectedPeriod: { type: PeriodType.Week, value: getWeekIdentifier(new Date()) },
    selectedView: View.Weekly,
}

const dataSlice = createSlice({
    name: 'data',
    initialState,
    reducers: {
        setData(state: DataState, action: PayloadAction<ProcessedData>) {
            state.data = action.payload
        },
        setSelectedPeriod(state: DataState, action: PayloadAction<Period>) {
            state.selectedPeriod = action.payload
        },
        setSelectedView(state: DataState, action: PayloadAction<View>) {
            state.selectedView = action.payload
        },
    },
})

export const { setData, setSelectedPeriod, setSelectedView } = dataSlice.actions
export default dataSlice.reducer
