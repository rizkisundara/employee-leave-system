export type HolidayType = "national" | "religious" | "company" | "regional";

export type Holiday = {
  id: string;
  name: string;
  date: string;
  type: HolidayType;
  description?: string;
  isRecurring: boolean;
};
