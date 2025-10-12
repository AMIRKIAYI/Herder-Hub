export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
  success: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  page: number;
  totalPages: number;
  totalItems: number;
}