export interface Contest {
  contestId: string;
  title: string;
  bannerUrl?: string;
  description: string;
  numOfAward: number;
  startDate: string;
  endDate: string;
  status: ContestStatus;
  createdBy: string;
  roundId: string;
  examinerRole: ExaminerRole;
}

export interface ContestFilter {
  status?: ContestStatus;
}

export type ContestStatus =
  | "ACTIVE"
  | "UPCOMING"
  | "ENDED"
  | "COMPLETED"
  | "DRAFT"
  | "ALL";

export type ExaminerRole = "ROUND_1" | "REVIEW_ROUND_1" | "ROUND_2";
