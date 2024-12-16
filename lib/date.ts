export function parseCustomDate(dateString: string): Date {
    return new Date(dateString);
}

export function startOfWeek(day: Date): Date {
    const date = new Date(day);
    const dayOfWeek = date.getDay();
    const diff = date.getDate() - dayOfWeek;

    date.setDate(diff);
    date.setHours(0, 0, 0, 0);

    return date;
}

export function endOfWeek(day: Date): Date {
    const date = new Date(day);
    const dayOfWeek = date.getDay();
    const diff = date.getDate() - dayOfWeek + 6;

    date.setDate(diff);
    date.setHours(0, 0, 0, 0);

    return date;
}

export function getWeekIdentifier(date: Date): string {
    const weekDate = startOfWeek(date);
    return weekDate.toDateString();
};
