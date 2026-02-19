import { Component, inject, OnInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { PlansService } from '../../services/plan.service';
import { PlanItem } from "../plan-item/plan-item";
import { NavArrow } from "../../../../shared/components/nav-arrow/nav-arrow";

@Component({
  selector: 'app-plans-intro',
  imports: [PlanItem, NavArrow],
  templateUrl: './plans-intro.html',
  styleUrl: './plans-intro.scss'
})
export class PlansIntro implements OnInit, OnDestroy {
  plansService = inject(PlansService);
  private router = inject(Router);
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
    this.plansService.getPlans(page, null, this.currentPageSize);
  }

  onPageSizeChange(pageSize: number) {
    this.plansService.getPlans(0, null, pageSize);
  }

  onReset() {
    this.resetPagination();
    this.plansService.getPlans();
  }

  goNext() {
    const currentPage = this.pagination().currentPage;
    const totalPages = this.pagination().totalPages;
    if (currentPage < totalPages - 1) {
      this.onPageChange(currentPage + 1);
    }
  }

  goBack() {
    const currentPage = this.pagination().currentPage;
    if (currentPage > 0) {
      this.onPageChange(currentPage - 1);
    }
  }

  navigateToPlans() {
    this.router.navigate(['/planes']);
  }
}
