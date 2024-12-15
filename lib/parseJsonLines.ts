import { format } from 'date-fns';

import { getWeekIdentifier, parseCustomDate } from '@/lib/date';
import type { ProcessedData } from '@/store/dataSlice';

export interface Entry {
    date: string;
    // Add other properties as needed
}

export function parseJsonLines(content: string): ProcessedData {
    const lines = content.trim().split('\n');
    const data: ProcessedData = {};

    lines.forEach(line => {
        try {
            const entry: Entry = JSON.parse(line);
            if (entry && entry.date) {
                const parsedDate = parseCustomDate(entry.date);
                if (!isNaN(parsedDate.getTime())) {
                    const week = getWeekIdentifier(parsedDate);
                    const weekday = format(parsedDate, 'EEEE');

                    if (!data[week]) {
                        data[week] = {
                            'Sunday': 0,
                            'Monday': 0,
                            'Tuesday': 0,
                            'Wednesday': 0,
                            'Thursday': 0,
                            'Friday': 0,
                            'Saturday': 0,
                        };
                    }

                    data[week][weekday]++;
                } else {
                    console.error('Invalid date:', entry.date);
                }
            } else {
                console.error('Invalid entry:', line);
            }
        } catch (error) {
            console.error('Error parsing line:', line, error);
        }
    });

    return data;
}
