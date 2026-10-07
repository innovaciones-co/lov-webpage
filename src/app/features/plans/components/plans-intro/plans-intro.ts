import { Component, computed, inject, OnInit, OnDestroy, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { PlansService } from '../../services/plan.service';
import { CategoryService } from '../../services/category.service';
import { sortPlansForDisplay } from '../../utils/sort-plans';
import { PlanItem } from "../plan-item/plan-item";
import { NavArrow } from "../../../../shared/components/nav-arrow/nav-arrow";
import { LovHeart } from '../../../../shared/components/lov-heart/lov-heart';

@Component({
  selector: 'app-plans-intro',
  imports: [PlanItem, NavArrow, LovHeart],
  templateUrl: './plans-intro.html',
  styleUrl: './plans-intro.scss'
})
export class PlansIntro implements OnInit, OnDestroy {
  plansService = inject(PlansService);
  private categoryService = inject(CategoryService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  // The carousel pages through the sorted list on the client (same order as /planes:
  // monthly plans first, most expensive first), instead of asking the API page by page,
  // which returned plans in the API's own order.
  pageSize = signal(1);
  page = signal(0);

  sortedPlans = computed(() =>
    sortPlansForDisplay(this.plansService.getPlansSignal()(), this.categoryService.getCategoriesSignal()()));

  totalPages = computed(() => Math.max(1, Math.ceil(this.sortedPlans().length / this.pageSize())));

  visiblePlans = computed(() => {
    const start = this.page() * this.pageSize();
    return this.sortedPlans().slice(start, start + this.pageSize());
  });

  get loading() {
    return this.plansService.getLoadingSignal();
  }

  private getPageSize(): number {
    if (!isPlatformBrowser(this.platformId)) return 1;

    if (window.matchMedia('(min-width: 1024px)').matches) {
      return 3; // large breakpoint
    } else if (window.matchMedia('(min-width: 768px)').matches) {
      return 2; // tablet breakpoint
    }
    return 1; // mobile
  }

  private updatePlansOnResize = () => {
    if (!isPlatformBrowser(this.platformId)) return;

    const newPageSize = this.getPageSize();
    if (newPageSize !== this.pageSize()) {
      // Keep showing roughly the same plans after the layout changes.
      const firstVisible = this.page() * this.pageSize();
      this.pageSize.set(newPageSize);
      this.page.set(Math.floor(firstVisible / newPageSize));
    }
  };

  ngOnDestroy() {
    this.plansService.resetPagination();
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('resize', this.updatePlansOnResize);
    }
  }

  ngOnInit() {
    this.pageSize.set(this.getPageSize());
    this.plansService.getPlans(0, null, 100);
    if (this.categoryService.getCategoriesSignal()().length === 0) {
      this.categoryService.getCategories();
    }
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('resize', this.updatePlansOnResize);
    }
  }

  goNext() {
    if (this.page() < this.totalPages() - 1) {
      this.page.update(page => page + 1);
    }
  }

  goBack() {
    if (this.page() > 0) {
      this.page.update(page => page - 1);
    }
  }

  navigateToPlans() {
    this.router.navigate(['/planes']);
  }
}
