import type { ProcessedData } from "@/store/dataSlice";

const getPossibleEntries = (view: string) => {
  switch (view) {
    case "daily":
      return Array.from({ length: 24 }, (_, i) => i); // Hours of the day
    case "weekly":
      return Array.from({ length: 7 }, (_, i) => i); // Days of the week
    case "monthly":
      return Array.from({ length: 31 }, (_, i) => i + 1); // Days of the month
    case "yearly":
      return Array.from({ length: 12 }, (_, i) => i); // Months of the year
    default:
      return [];
  }
};

export const formatData = (data: ProcessedData, view: string, selectedDate: Date) => {
  const filteredData = data.filter(entry => {
    const entryDate = new Date(entry.timestamp);
    
    switch (view) {
      case "daily":
        return entryDate.toDateString() === selectedDate.toDateString();
      case "weekly":
        const startOfWeek = new Date(selectedDate);
        startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return entryDate >= startOfWeek && entryDate <= endOfWeek;
      case "monthly":
        return (
          entryDate.getFullYear() === selectedDate.getFullYear() &&
          entryDate.getMonth() === selectedDate.getMonth()
        );
      case "yearly":
        return entryDate.getFullYear() === selectedDate.getFullYear();
      default:
        return false;
    }
  });

  const aggregatedData = filteredData.reduce((acc, entry) => {
    const entryDate = new Date(entry.timestamp);
    
    let key;
    switch (view) {
      case "daily":
        key = entryDate.getHours();
        break;
      case "weekly":
        key = entryDate.getDay();
        break;
      case "monthly":
        key = entryDate.getDate();
        break;
      case "yearly":
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
