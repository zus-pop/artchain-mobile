import { RegisterRequest } from "./auth";

export interface AssignChildRequest {
  studentData: RegisterRequest[];
  guardianId: string;
}

export interface GuardianChild {
  userId: string;
  fullName: string;
  username: string;
  guardianId: string;
  email: string;
  status: 1 | 0;
  phone: string | null;
  birthday: Date | null;
  schoolName: string | null;
  ward: string | null;
  grade: string | null;
}
