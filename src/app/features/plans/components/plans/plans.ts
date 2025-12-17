import { Component, signal } from '@angular/core';
import { NavigationTabsComponent } from "../../../../shared/components/navigation-tabs/navigation-tabs";
import { PlansDashboard } from '../plans-dashboard/plans-dashboard';

@Component({
  selector: 'app-plans',
  imports: [NavigationTabsComponent],
  templateUrl: './plans.html',
  styleUrl: './plans.scss'
})
export class Plans {
  activeTabId = signal<string | null>(null);

  tabs = [
    {
      id: 'all',
      title: 'Todos los planes',
      component: PlansDashboard,
    },
    {
      id: 'pre-paid',
      title: 'Planes prepago',
      component: PlansDashboard,
      inputs: {}
    },
    {
      id: 'post-paid',
      title: 'Planes postpago',
      component: PlansDashboard,
      inputs: {}
    },
    {
      id: 'data-only',
      title: 'Solo datos',
      component: PlansDashboard,
      inputs: {}
    },
  ];
}
