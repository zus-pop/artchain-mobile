export interface Award {
  awardId: number;
  contestId: number;
  name: string;
  description: string;
  rank: number;
  quantity: number;
  prize: string;
  createdAt: string;
  updatedAt: string;
}

export interface Contest {
  contestId: number;
  title: string;
  bannerUrl?: string;
  description: string;
  numOfAward: number;
  round2Quantity: number;
  ruleUrl: string;
  startDate: string;
  endDate: string;
  status: ContestStatus;
  createdBy: string;
  rounds: Rounds[];
  examinerRole: ExaminerRole;
  awards?: Award[];
}
export interface ExaminerContest {
  contestId: number;
  title: string;
  bannerUrl?: string;
  description: string;
  numOfAward: number;
  round2Quantity: number;
  ruleUrl: string;
  startDate: string;
  endDate: string;
  status: ContestStatus;
  createdBy: string;
  rounds: Rounds[];
  examinerRole: ExaminerRole;
  isScheduleEnforced: boolean;
  canEvaluate: boolean;
  awards?: Award[];
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
  page?: number;
  limit?: number;
  suggest?: string;
}

// types
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export type ContestStatus =
  | "ACTIVE"
  | "UPCOMING"
  | "ENDED"
  | "COMPLETED"
  | "DRAFT"
  | "ALL";

export type ExaminerRole = "ROUND_1" | "ROUND_2";
