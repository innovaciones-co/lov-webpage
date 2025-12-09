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

