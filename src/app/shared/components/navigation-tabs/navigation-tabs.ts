import { Component, input, output, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Tab {
  id: string;
  title: string;
  content: string;
  closable?: boolean;
}

@Component({
  selector: 'app-navigation-tabs',
  templateUrl: './navigation-tabs.html',
  styleUrl: './navigation-tabs.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class NavigationTabsComponent {
  tabs = input<Tab[]>([]);
  activeTabId = signal<string | null>(null);
  tabClosed = output<string>();

  isActive(tab: Tab): boolean {
    return tab.id === this.activeTabId();
  }

  selectTab(tabId: string): void {
    this.activeTabId.set(tabId);
  }

  closeTab(tab: Tab, event: MouseEvent): void {
    event.stopPropagation();
    this.tabClosed.emit(tab.id);

    // If the closed tab was active, update activeTabId
    if (this.activeTabId() === tab.id) {
      const remainingTabs = this.tabs().filter(t => t.id !== tab.id);
      this.activeTabId.set(remainingTabs.length > 0 ? remainingTabs[0].id : null);
    }
  }

  ngOnInit() {
    const tabs = this.tabs();
    if (tabs.length > 0) {
      this.activeTabId.set(tabs[0].id);
    }
  }
}
