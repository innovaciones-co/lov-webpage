import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { NavigationTabsComponent } from "../../shared/components/navigation-tabs/navigation-tabs";
import { NewPortabilityComponent } from './components/new-portability/new-portability';
import { PortabilityStatusComponent } from './components/portability-status/portability-status';

@Component({
  selector: 'app-portability',
  templateUrl: './portability.html',
  styleUrls: ['./portability.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NavigationTabsComponent
  ],
})
export class Portability implements OnInit {
  private route = inject(ActivatedRoute);

  activeTabId = signal<string | null>(null);

  tabs = [
    {
      id: 'new-portability',
      title: 'Nueva portabilidad',
      component: NewPortabilityComponent,
    },
    {
      id: 'portability-status ',
      title: 'Estado de la portabilidad',
      component: PortabilityStatusComponent,
      inputs: {}
    },
  ];

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const tabId = params['tab'];
      if (tabId) {
        const tab = this.tabs.find(t => t.id.trim() === tabId);
        if (tab) {
          this.activeTabId.set(tab.id);
        }
      }
    });
  }

}
