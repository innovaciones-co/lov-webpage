import { Component, inject, input, OnInit } from '@angular/core';
import { PlanItem } from "../plan-item/plan-item";
import { PlansService } from '../../services/plan.service';
import { Loading } from "../../../../shared/components/loading/loading";

@Component({
  selector: 'app-plans-dashboard',
  imports: [PlanItem, Loading],
  templateUrl: './plans-dashboard.html',
  styleUrl: './plans-dashboard.scss'
})
export class PlansDashboard implements OnInit {
  categoryId = input<number | null>(null);
  plansService = inject(PlansService);

  get plans() {
    return this.plansService.getPlansSignal();
  }

  get sortedPlans() {
    const plans = this.plansService.getPlansSignal()();
    if (!plans || plans.length === 0) return [];

    const sorted = [...plans].sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return a.id - b.id;
    });

    return sorted;
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
    this.plansService.getPlans(0, this.categoryId());
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
