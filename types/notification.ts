export interface AddPushToken {
  token_value: string;
}

export interface Notifications {
  notificationId: string;
  accountId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}
