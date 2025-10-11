import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, finalize, Observable } from 'rxjs';
import { FAQ, FAQCategory, FAQResponse, PaginationState } from '../models/faq.models';

@Injectable({
    providedIn: 'root'
})
export class FaqService {
    private http = inject(HttpClient);

    private readonly baseUrl = 'https://lov-webservices-dev.innovaciones.co/api';

    // State management
    private faqsSubject = new BehaviorSubject<FAQ[]>([]);
    private categoriesSubject = new BehaviorSubject<FAQCategory[]>([]);
    private paginationSubject = new BehaviorSubject<PaginationState>({
        currentPage: 0,
        totalPages: 0,
        pageSize: 5,
        hasMorePages: false
    });
    private loadingSubject = new BehaviorSubject<boolean>(false);

    // Public observables
    faqs$ = this.faqsSubject.asObservable();
    categories$ = this.categoriesSubject.asObservable();
    pagination$ = this.paginationSubject.asObservable();
    loading$ = this.loadingSubject.asObservable();

    loadCategories(): Observable<FAQCategory[]> {
        return this.http.get<FAQCategory[]>(`${this.baseUrl}/faqCategories`);
    }

    loadFAQs(page: number = 0, categoryId: number | null = null, pageSize: number = 5): Observable<FAQResponse> {
        this.loadingSubject.next(true);

        const categoryParam = categoryId ? `&category=${categoryId}` : '';
        const url = `${this.baseUrl}/faqs?size=${pageSize}&page=${page}${categoryParam}`;

        return this.http.get<FAQResponse>(url).pipe(
            finalize(() => this.loadingSubject.next(false))
        );
    }

    updateFAQs(faqs: FAQ[], append: boolean = false) {
        const currentFaqs = this.faqsSubject.value;
        const newFaqs = append ? [...currentFaqs, ...faqs] : faqs;
        this.faqsSubject.next(newFaqs);
    }

    updateCategories(categories: FAQCategory[]) {
        this.categoriesSubject.next(categories);
    }

    updatePagination(pagination: Partial<PaginationState>) {
        const current = this.paginationSubject.value;
        this.paginationSubject.next({ ...current, ...pagination });
    }

    resetFAQs() {
        this.faqsSubject.next([]);
    }

    getCurrentPagination(): PaginationState {
        return this.paginationSubject.value;
    }

    getCurrentFAQs(): FAQ[] {
        return this.faqsSubject.value;
    }

    getCurrentCategories(): FAQCategory[] {
        return this.categoriesSubject.value;
    }

    isLoading(): boolean {
        return this.loadingSubject.value;
    }
}