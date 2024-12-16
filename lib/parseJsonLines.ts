import { parseCustomDate } from '@/lib/date';
import type { ProcessedData, Entry } from '@/store/dataSlice';

export function parseJsonLines(content: string): ProcessedData {
    const lines = content.trim().split('\n');
    const data: ProcessedData = [];

    lines.forEach(line => {
        try {
            const entry: Omit<Entry, 'timestamp'> & { date: string } = JSON.parse(line);
            if (entry && entry.date) {
                const parsedDate = parseCustomDate(entry.date);
                if (!isNaN(parsedDate.getTime())) {
                    data.push({ timestamp: parsedDate.getTime() });
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
