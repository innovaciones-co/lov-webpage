import { Component, inject, OnInit } from '@angular/core';
import { PlansService } from '../../services/plan.service';
import { CurrencyPipe } from "../../../../core/pipes/currency.pipe";
import { PlanItem } from "../plan-item/plan-item";

@Component({
  selector: 'app-plans',
  imports: [PlanItem],
  templateUrl: './plans.html',
  styleUrl: './plans.scss'
})
export class Plans implements OnInit {
  plansService = inject(PlansService);

  constructor() {
    this.plansService.getPlans();
  }

  get plans() {
    return this.plansService.getPlansSignal();
  }

  get pagination() {
    return this.plansService.getPaginationSignal();
  }

  get loading() {
    return this.plansService.getLoadingSignal();
  }

  loadMore() {
    const currentPage = this.pagination().currentPage + 1;
    this.plansService.getPlans(currentPage);
  }

  resetPagination() {
    this.plansService.resetPagination();
  }

  ngOnDestroy() {
    this.plansService.resetPagination();
  }

  ngOnInit() {
    this.plansService.getPlans();
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
