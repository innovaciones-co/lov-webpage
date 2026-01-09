import { HttpClient } from "@angular/common/http";
import { inject, Injectable, signal } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { Paginator } from "../../../core/models/paginator.model";
import { Category } from "../models/category.model";

@Injectable({
    providedIn: 'root'
})
export class CategoryService {
    private http = inject(HttpClient);
    private readonly baseUrl;

    private categories = signal<Category[]>([]);
    private loading = signal<boolean>(false);

    constructor() {
        this.baseUrl = environment.apiUrl;
    }

    getCategories() {
        this.loading.set(true);

        const url = `${this.baseUrl}/categories`;

        return this.http.get<Paginator<Category>>(url).subscribe({
            next: (data: Paginator<Category>) => {
                this.categories.set(data.content);
                this.loading.set(false);
            },
            error: () => {
                this.loading.set(false);
            }
        });
    }

    getCategoriesSignal() {
        return this.categories.asReadonly();
    }

    getLoadingSignal() {
        return this.loading.asReadonly();
    }

    resetCategories() {
        this.categories.set([]);
    }
}   
