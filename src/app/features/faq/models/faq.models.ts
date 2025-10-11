export interface FAQ {
    id: number;
    question: string;
    answer: string;
    category: number;
    active: boolean;
    isActive: boolean;
}

export interface FAQCategory {
    id: number;
    name: string;
}

export interface FAQResponse {
    content: FAQ[];
    page: {
        size: number;
        number: number;
        totalElements: number;
        totalPages: number;
    };
}

export interface PaginationState {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    hasMorePages: boolean;
}