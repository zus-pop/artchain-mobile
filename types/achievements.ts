

export interface AchievementsApiResponse {
  success: boolean;
  data: AchievementsData;
}

export interface AchievementsData {
  user: AchievementUser;
  achievements: AchievementItem[];
  totalAchievements: number;
}

export interface AchievementUser {
  userId: string;
  fullName: string;
}

export interface AchievementItem {
  paintingId: string;
  paintingTitle: string;
  paintingImage: string; 
  award: AchievementAward;
  contest: AchievementContest;
  achievedDate: string; 
}

export interface AchievementAward {
  awardId: number;
  name: string;
  description: string;
  rank: number;
  prize: number; // VND
}

export interface AchievementContest {
  contestId: number;
  title: string;
  startDate: string; 
  endDate: string;   
}
