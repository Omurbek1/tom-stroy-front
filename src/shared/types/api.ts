export interface PaginatedResponse<T> {
  data: T[];
  meta: { nextCursor: string | null; limit: number };
}

export interface ItemResponse<T> {
  data: T;
}
