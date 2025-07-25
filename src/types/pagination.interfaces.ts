export interface IPaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  nextPage: number | null;
}
