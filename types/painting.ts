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
}

export interface PaintingFilter {
  contestId?: string;
}

export interface EvaluationRequest {
  paintingId: string;
  examinerId: string;
  score: number;
  feedback: string;
}

export interface PaintingEvaluation {
  id: string;
  paintingId: string;
  examinerId: string;
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
