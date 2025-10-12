export interface LoginRequest {
  username: string;
  password: string;
}

export type UserRole = "COMPETITOR" | "GUARDIAN" | "ADMIN" | "STAFF";

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  fullName: string;
  role: UserRole;
  // Competitor specific fields
  schoolName?: string;
  grade?: string;
  ward?: string;
  birthday?: string;
  // Guard specific fields
  phone?: string;
  employeeId?: string;
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
