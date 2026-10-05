import { Component, inject, input, OnInit } from '@angular/core';
import { PlanItem } from "../plan-item/plan-item";
import { PlansService } from '../../services/plan.service';
import { Loading } from "../../../../shared/components/loading/loading";
import { Plan } from '../../models/plan.model';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-plans-dashboard',
  imports: [PlanItem, Loading],
  templateUrl: './plans-dashboard.html',
  styleUrl: './plans-dashboard.scss'
})
export class PlansDashboard implements OnInit {
  categoryId = input<number | null>(null);
  plansService = inject(PlansService);
  private categoryService = inject(CategoryService);

  get plans() {
    return this.plansService.getPlansSignal();
  }

  get sortedPlans() {
    const plans = this.plansService.getPlansSignal()();
    if (!plans || plans.length === 0) return [];

    // Monthly plans (the "Planes Mensuales" category) go first, most expensive to cheapest;
    // everything else (daily plans, data and voice packs) keeps its admin-defined order after them.
    const monthlyCategoryIds = new Set(this.categoryService.getCategoriesSignal()()
      .filter(category => category.name.toLowerCase().includes('mensual'))
      .map(category => category.id));
    const isMonthly = (plan: Plan) => monthlyCategoryIds.size > 0
      ? monthlyCategoryIds.has(plan.category)
      : plan.validity === 30;
    const sorted = plans.filter(plan => plan.isActive).sort((a, b) => {
      if (isMonthly(a) !== isMonthly(b)) return isMonthly(a) ? -1 : 1;
      if (isMonthly(a) && a.totalPrice !== b.totalPrice) return b.totalPrice - a.totalPrice;
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
