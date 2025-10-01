export interface Contest {
  contestId: string;
  title: string;
  description: string;
  numOfAward: number;
  startDate: string;
  endDate: string;
  status: ContestStatus;
  createdBy: string;
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
export interface Submission {
  id: string;
  contestId: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  imageUri: string;
  status: "pending" | "accepted" | "winner" | "rejected";
  submissionDate: string;
  views: number;
  likes: number;
  votes: number;
  comments: Comment[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  title: string;
  avatar: string;
  bio: string;
  stats: UserStats;
  achievements: Achievement[];
}

export interface UserStats {
  totalSubmissions: number;
  wins: number;
  views: number;
  likes: number;
  rating: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  date: string;
  contestId?: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  date: string;
  likes: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export interface Judge {
  id: string;
  name: string;
  title: string;
  avatar: string;
  bio: string;
  expertise: string[];
}

export interface ContestRule {
  id: string;
  title: string;
  description: string;
  required: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "contest" | "submission" | "result" | "system";
  isRead: boolean;
  date: string;
  actionUrl?: string;
}

export interface Vote {
  id: string;
  submissionId: string;
  userId: string;
  rating: number;
  comment?: string;
  date: string;
}
