import { HttpClient } from "@angular/common/http";
import { inject, Injectable, signal } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { PaginationState, Paginator } from "../../../core/models/paginator.model";
import { Plan } from "../models/plan.model";

@Injectable({
    providedIn: 'root'
})
export class PlansService {
    private http = inject(HttpClient);
    private readonly baseUrl;

    private plans = signal<Plan[]>([]);
    private paginationSubject = signal<PaginationState>({
        currentPage: 0,
        totalPages: 0,
        pageSize: 5,
        hasMorePages: false
    });
    private loading = signal<boolean>(false);

    constructor() {
        this.baseUrl = environment.apiUrl;
    }

    getPlans(page: number = 0, categoryId: number | null = null, pageSize: number = 5) {
        console.log('Fetching plans:', { page, categoryId, pageSize });
        this.loading.set(true);

        const categoryParam = categoryId ? `&category=${categoryId}` : '';
        const url = `${this.baseUrl}/plans?size=${pageSize}&page=${page}${categoryParam}`;

        return this.http.get<Paginator<Plan>>(url).subscribe({
            next: (data: Paginator<Plan>) => {
                this.plans.set(data.content);
                this.loading.set(false);
            },
            error: () => {
                this.loading.set(false);
            }
        });
    }

    getPlansSignal() {
        return this.plans.asReadonly();
    }

    getPaginationSignal() {
        return this.paginationSubject.asReadonly();
    }

    getLoadingSignal() {
        return this.loading.asReadonly();
    }

    setPaginationState(pagination: PaginationState) {
        this.paginationSubject.set(pagination);
    }

    resetPagination() {
        this.paginationSubject.set({
            currentPage: 0,
            totalPages: 0,
            pageSize: 5,
            hasMorePages: false
        });
    }

    resetPlans() {
        this.plans.set([]);
    }
}   