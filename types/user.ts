import { UserRole } from "./auth";

export interface User {
  userId: string;
  fullName: string;
  email: string;
  role: UserRole;
  phone?: string;
  birthday?: string;
  schoolName?: string;
  ward?: string;
  grade?: string;
}
