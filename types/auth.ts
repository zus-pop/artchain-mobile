export interface LoginRequest {
  username: string;
  password: string;
}

export type UserRole =
  | "COMPETITOR"
  | "GUARDIAN"
  | "ADMIN"
  | "STAFF"
  | "EXAMINER";

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  // Competitor specific fields
  schoolName?: string;
  grade?: string;
  ward?: string;
  birthday?: string;
  // Guard specific fields
}

export interface AuthResponse {
  access_token: string;
}

export interface WhoAmI {
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
