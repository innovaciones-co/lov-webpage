import { Component, inject, OnInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PlansService } from '../../services/plan.service';
import { CurrencyPipe } from "../../../../core/pipes/currency.pipe";
import { PlanItem } from "../plan-item/plan-item";

@Component({
  selector: 'app-plans-intro',
  imports: [PlanItem],
  templateUrl: './plans-intro.html',
  styleUrl: './plans-intro.scss'
})
export class PlansIntro implements OnInit, OnDestroy {
  plansService = inject(PlansService);
  private platformId = inject(PLATFORM_ID);
  private currentPageSize: number = 0;

  get plans() {
    return this.plansService.getPlansSignal();
  }

  get pagination() {
    return this.plansService.getPaginationSignal();
  }

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
    if (newPageSize !== this.currentPageSize) {
      this.currentPageSize = newPageSize;
      this.plansService.getPlans(0, null, newPageSize);
    }
  };

  loadMore() {
    const currentPage = this.pagination().currentPage + 1;
    this.plansService.getPlans(currentPage);
  }

  resetPagination() {
    this.plansService.resetPagination();
  }

  ngOnDestroy() {
    this.plansService.resetPagination();
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('resize', this.updatePlansOnResize);
    }
  }

  ngOnInit() {
    const pageSize = this.getPageSize();
    this.currentPageSize = pageSize;
    this.plansService.getPlans(0, null, pageSize);
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('resize', this.updatePlansOnResize);
    }
  }

  onCategoryChange(categoryId: number | null) {
    this.plansService.getPlans(0, categoryId);
  }

  onPageChange(page: number) {
    this.plansService.getPlans(page);
  }

  onPageSizeChange(pageSize: number) {
    this.plansService.getPlans(0, null, pageSize);
  }

  onReset() {
    this.resetPagination();
    this.plansService.getPlans();
  }
}
