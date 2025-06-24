export interface TableResult<T> {
    items: T[];
    page: number;
    pageSize: number;
    totalItems: number;    
    totalPages: number;
}