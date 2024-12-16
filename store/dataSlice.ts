import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { getWeekIdentifier } from '@/lib/date';

interface DataState {
    data: ProcessedData | null
    selectedWeek: string
}

export interface ProcessedData extends Array<Entry> {}

export interface Entry {
    timestamp: number;
    // Add other properties as needed
}

const initialState: DataState = {
    data: null,
    selectedWeek: getWeekIdentifier(new Date()),
}

const dataSlice = createSlice({
    name: 'data',
    initialState,
    reducers: {
        setData(state: DataState, action: PayloadAction<ProcessedData>) {
            state.data = action.payload
        },
        setSelectedWeek(state: DataState, action: PayloadAction<string>) {
            state.selectedWeek = action.payload
        },
    },
})

export const { setData, setSelectedWeek } = dataSlice.actions
export default dataSlice.reducer
