export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta: {
    total: number;
    page: string;
    limit: string;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
