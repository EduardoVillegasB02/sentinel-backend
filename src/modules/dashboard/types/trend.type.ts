export type Trend = {
  sent: number;
  approved: number;
  days: Array<{
    date: string;
    sent: number;
    approved: number;
    subjects: Array<{
      sent: number;
      approved: number;
    }>;
  }>;
};
