import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { NavigationTabsComponent } from "../../../../shared/components/navigation-tabs/navigation-tabs";
import { PlansDashboard } from '../plans-dashboard/plans-dashboard';
import { CategoryService } from '../../services/category.service';
import { DeviceDetectionService } from '../../../../core/services/device-detection.service';

@Component({
  selector: 'app-plans',
  imports: [NavigationTabsComponent],
  templateUrl: './plans.html',
  styleUrl: './plans.scss'
})
export class Plans implements OnInit {
  activeTabId = signal<string | null>(null);
  categoryService = inject(CategoryService);
  deviceDetectionService = inject(DeviceDetectionService);
  isMobileView = signal<boolean>(false);

  tabs = computed(() => {
    const categories = this.categoryService.getCategoriesSignal();

    return [
      {
        id: 'all',
        title: 'Todos los planes',
        component: PlansDashboard,
      },
      ...categories().map(category => ({
        id: `category-${category.id}`,
        title: category.name,
        component: PlansDashboard,
        inputs: { categoryId: category.id }
      }))
    ];
  });

  ngOnInit() {
    this.categoryService.getCategories();
    this.updateMobileView();
    window.addEventListener('resize', () => this.updateMobileView());
  }

  private updateMobileView(): void {
    this.isMobileView.set(this.deviceDetectionService.isMobile());
  }
}
