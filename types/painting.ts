import { Contest } from "./contest";

export interface PaintingUploadRequest {
  title: string;
  description?: string;
  competitorId: string;
  contestId: string;
  file: {
    uri: string;
    name: string;
    type: string;
  };
  roundId: string;
}

export interface Painting {
  paintingId: string;
  roundId: string;
  awardId: string | null;
  contest: Contest;
  competitorId: string;
  title: string;
  description?: string;
  imageUrl: string;
  submissionDate: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  isPassed: boolean | null;
  user: {
    userId: string;
    username: string;
    email: string;
    fullName: string;
    phone: string | null;
  };
}

export interface PaintingFilter {
  contestId?: string;
  roundName?: "ROUND_1" | "ROUND_2";
  is_passed?: boolean | null;
  status?: "PENDING" | "ACCEPTED" | "REJECTED";
  examinerId?: string;
}

export interface Round1PreliminaryEvaluationRequest {
  paintingId: string;
  examinerId: string;
  isPassed: boolean;
}
export interface ReviewRound1EvaluationRequest {
  paintings: {
    paintingId: string;
    isPassed: boolean;
  }[];
}
export interface Round1EvaluationRequest {
  paintingId: string;
  examinerId: string;
  score: number;
  feedback: string;
}

export interface Round2EvaluationRequest {
  paintingId: string;
  examinerId: string;
  creativityScore: number;
  compositionScore: number;
  colorScore: number;
  technicalScore: number;
  aestheticScore: number;
}

export interface PaintingEvaluation {
  id: string;
  paintingId: string;
  examinerId: string;
  examinerName: string;
  score: number;
  feedback: string;
  evaluationDate: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  examiner: {
    examinerId: string;
    specialization: string | null;
    assignedScheduleId: string | null;
  };
}
