import { ApiResponse } from "./api-response";

export interface Contest {
  filter(arg0: (d: any) => boolean): any;
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

// types
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export const normalizePagination = (
  p: ApiResponse<any>["meta"]
): Pagination => ({
  page: Number(p.page ?? 1),
  limit: Number(p.limit ?? 10),
  total: Number(p.total ?? 0),
  totalPages: Number(p.totalPages ?? 0),
  hasNext: Boolean(p.hasNextPage),
  hasPrev: Boolean(p.hasPreviousPage),
});

export type ContestStatus =
  | "ACTIVE"
  | "UPCOMING"
  | "ENDED"
  | "COMPLETED"
  | "DRAFT"
  | "ALL";

export type ExaminerRole = "ROUND_1" | "ROUND_2";
