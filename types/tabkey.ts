import { Ionicons } from "@expo/vector-icons";

// ===== Types =====
export type TabKey = "threads" | "replies" | "media" | "reposts";

export interface RawProfile {
  fullName: string;
  email: string;
  phone: string | null;
  birthday: string;          // ISO string
  schoolName: string;
  ward: string;
  grade: string;             // "5", "6", ...
}

export interface UserProfile {
  name: string;
  handle: string;            // lấy từ email
  email: string;
  phone: string;             // đã chuẩn hoá: '' nếu null
  location: string;          // ward
  avatar: string;            // '' nếu chưa có
  followers: number;
  subtitle?: string;         // "Lớp 5 • Trường ..."
}

export type SubmissionStatus = "winner" | "accepted" | "pending" | "rejected";

export interface SubmissionItem {
  id: string;
  title: string;
  contest: string;
  submissionDate: string;    // YYYY-MM-DD
  status: SubmissionStatus;
  image: string;
  views: number;
  likes: number;
}

export interface UserStats {
  totalSubmissions: number;
  wins: number;
  views: number;
  likes: number;
  rating: number;
}

export interface AchievementItem {
  id: string;
  title: string;
  place: string;
}

export interface ColorTokens {
  background: string;
  foreground: string;
  card: string;
  border: string;
  muted: string;
  mutedForeground: string;
  primary: string;
  primaryForeground: string;
  destructive: string;
  chart1: string;
}

export interface KPIProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  C: ColorTokens;
  iconColor?: string;
  iconBg?: string;
}

export interface EmptyProps {
  label: string;
  chips?: string[];
}
