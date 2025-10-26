export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta: {
    total: number;
    page: string;
    limit: string;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
