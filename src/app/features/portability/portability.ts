import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { NavigationTabsComponent } from "../../shared/components/navigation-tabs/navigation-tabs";
import { NewPortabilityComponent } from './components/new-portability/new-portability';
import { PortabilityStatusComponent } from './components/portability-status/portability-status';
import { DeviceDetectionService } from '../../core/services/device-detection.service';

interface Tab {
  id: string;
  title: string;
  component: any;
  inputs?: Record<string, any>;
}

interface TabTitles {
  short: string;  // Mobile when not selected
  long: string;   // Mobile when selected or desktop
}

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
  private deviceDetectionService = inject(DeviceDetectionService);

  activeTabId = signal<string | null>(null);
  isMobileView = signal(false);

  private readonly TAB_TITLES: Record<string, TabTitles> = {
    'new-portability': {
      short: 'Nueva',
      long: 'Nueva portabilidad'
    },
    'portability-status': {
      short: 'Consultar',
      long: 'Consultar portabilidad'
    }
  };

  private baseTabs: Tab[] = [
    {
      id: 'new-portability',
      title: 'Nueva portabilidad',
      component: NewPortabilityComponent,
    },
    {
      id: 'portability-status',
      title: 'Consultar portabilidad',
      component: PortabilityStatusComponent,
      inputs: {}
    },
  ];

  tabs = computed(() => {
    const isMobile = this.isMobileView();
    const activeId = this.activeTabId();

    return this.baseTabs.map(tab => ({
      ...tab,
      title: this.getTitleForTab(tab.id, isMobile, activeId === tab.id)
    }));
  });

  private getTitleForTab(tabId: string, isMobile: boolean, isSelected: boolean): string {
    const titles = this.TAB_TITLES[tabId];
    if (!titles) return 'Portabilidad';

    // If desktop or tab is selected on mobile, show long title
    if (!isMobile || isSelected) {
      return titles.long;
    }

    // Mobile without selection: short title
    return titles.short;
  }

  ngOnInit(): void {
    this.isMobileView.set(this.deviceDetectionService.isMobile());

    if (this.deviceDetectionService.isBrowser()) {
      window.addEventListener('resize', () => {
        this.isMobileView.set(this.deviceDetectionService.isMobile());
      });
    }

    this.route.queryParams.subscribe(params => {
      const tabId = params['tab'];
      if (tabId) {
        const tab = this.baseTabs.find(t => t.id.trim() === tabId);
        if (tab) {
          this.activeTabId.set(tab.id);
        }
      } else if (this.baseTabs.length > 0) {
        this.activeTabId.set(this.baseTabs[0].id);
      }
    });
  }

  onTabSelected(tabId: string): void {
    this.activeTabId.set(tabId);
  }
}
