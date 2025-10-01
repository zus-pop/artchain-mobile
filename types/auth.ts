export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  fullName: string;
  role: "COMPETITOR" | "GUARDIAN";
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
  fullName: string;
  email: string;
  phone?: string;
  birthday: string;
  schoolName: string;
  ward: string;
  grade: string;
}
