export interface Paginator<T> {
    content: T[];
    page: Page;
}

export interface Page {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
}

export interface PaginationState {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    hasMorePages: boolean;
}