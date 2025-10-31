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
  rounds: Rounds[];
  examinerRole: ExaminerRole;
}

export interface Rounds {
  roundId: string;
  contestId: string;
  table: string | null;
  name: "ROUND_1" | "ROUND_2";
  startDate: string;
  endDate: string;
  submissionDeadline: string;
  resultAnnounceDate: string;
  sendOriginalDeadline: string;
  status: string;
  createdAt: string;
  updatedAt: string;
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
