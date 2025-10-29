export interface Schedule {
  scheduleId: number;
  contestId: number;
  examinerId: string;
  task: string;
  date: Date;
  status: "ACTIVE";
  createdAt: Date;
  updatedAt: Date;
}
