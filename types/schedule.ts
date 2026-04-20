export interface Schedule {
  scheduleId: number;
  contestId: number;
  examinerId: string;
  task: string;
  round2Table: any | null; // If null = Round 1, if has data = Round 2
  date: Date | string;
  status: "ACTIVE" | "UPCOMING" | "ENDED";
  createdAt: Date | string;
  updatedAt: Date | string;
  canEvaluate: boolean;
  isScheduleEnforced: boolean;
}
