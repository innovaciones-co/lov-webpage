import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

// Models
import { FAQ, FAQCategory } from './models/faq.models';

// Services
import { DeviceDetectionService } from '../../core/services/device-detection.service';
import { ScrollDetectionService } from '../../core/services/scroll-detection.service';
import { FaqService } from './services/faq.service';

@Component({
  selector: 'app-faq',
  imports: [CommonModule],
  templateUrl: './faq.html',
  styleUrl: './faq.scss'
})
export class Faq implements OnInit, OnDestroy {
  // Services
  private faqService = inject(FaqService);
  private deviceService = inject(DeviceDetectionService);
  private scrollService = inject(ScrollDetectionService);
  private destroy$ = new Subject<void>();

  // Component state
  allFaqs: FAQ[] = []; // Store all FAQs
  faqs: FAQ[] = []; // Filtered FAQs for display
  categories: FAQCategory[] = [];

  selectedCategory: number | null = null;
  expandedFaqId: number | null = null;
  isLoading = false; ngOnInit() {
    this.setupSubscriptions();
    this.loadCategories();
    this.loadAllFAQs();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSubscriptions() {
    // Subscribe to service observables
    this.faqService.faqs$
      .pipe(takeUntil(this.destroy$))
      .subscribe(faqs => {
        this.allFaqs = faqs;
        this.filterFAQs();
      });

    this.faqService.categories$
      .pipe(takeUntil(this.destroy$))
      .subscribe(categories => this.categories = categories);

    this.faqService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.isLoading = loading);
  }

  // Delegate to device service
  isMobile(): boolean {
    return this.deviceService.isMobile();
  }

  private loadCategories() {
    this.faqService.loadCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories) => {
          this.faqService.updateCategories(categories);
        },
        error: (error) => {
          console.error('Error loading categories:', error);
        }
      });
  }

  private loadAllFAQs() {
    if (this.isLoading) return;

    // Load all FAQs by setting a large page size
    this.faqService.loadFAQs(0, null, 1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.faqService.updateFAQs(response.content, false);
        },
        error: (error) => {
          console.error('Error loading FAQs:', error);
        }
      });
  }

  private filterFAQs() {
    if (this.selectedCategory === null) {
      this.faqs = this.allFaqs;
    } else {
      this.faqs = this.allFaqs.filter(faq => faq.category === this.selectedCategory);
    }
  }

  // UI Event Handlers
  selectCategory(categoryId: number | null) {
    this.selectedCategory = categoryId;
    this.expandedFaqId = null;
    this.filterFAQs();
  }

  toggleFAQ(faqId: number) {
    this.expandedFaqId = this.expandedFaqId === faqId ? null : faqId;
  }



  // Utility methods
  getCategoryName(categoryId: number): string {
    const category = this.categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Sin categoría';
  }

  getCategoryCount(categoryId: number | null): number {
    if (categoryId === null) {
      return this.allFaqs.length;
    }
    return this.allFaqs.filter(faq => faq.category === categoryId).length;
  }

  formatAnswer(answer: string): string {
    return answer.replace(/\n/g, '<br>');
  }
}
