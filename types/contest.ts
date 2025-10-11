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
