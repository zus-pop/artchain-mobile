export interface CheckUploadedParams {

  id: number;

  userIds: string[];
}

export interface UserUploadStatus {
  userId: string;
  isUploaded: boolean;
}

export interface CheckUploadedResponse {
  success: boolean;
  data: UserUploadStatus[];
}
