import { Component, input, output, signal, ChangeDetectionStrategy, Type, OnInit } from '@angular/core';
import { CommonModule, NgComponentOutlet } from '@angular/common';

export interface Tab {
  id: string;
  title: string;
  component: Type<unknown>;
  inputs?: Record<string, unknown>;
  closable?: boolean;
}

@Component({
  selector: 'app-navigation-tabs',
  templateUrl: './navigation-tabs.html',
  styleUrl: './navigation-tabs.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NgComponentOutlet],
})
export class NavigationTabsComponent implements OnInit {
  tabs = input<Tab[]>([]);
  initialActiveTabId = input<string | null>(null);
  isMobile = input<boolean>(false);
  activeTabId = signal<string | null>(null);
  isDropdownOpen = signal<boolean>(false);
  tabClosed = output<string>();
  activeTabChanged = output<string>();

  isActive(tab: Tab): boolean {
    return tab.id === this.activeTabId();
  }

  toggleDropdown(): void {
    this.isDropdownOpen.update(open => !open);
  }

  selectTab(tabId: string): void {
    this.activeTabId.set(tabId);
    this.isDropdownOpen.set(false);
  }

  getActiveTabTitle(): string {
    const activeId = this.activeTabId();
    const activeTab = this.tabs().find(t => t.id === activeId);
    return activeTab?.title || 'Seleccionar';
  }

  closeTab(tab: Tab, event: MouseEvent): void {
    event.stopPropagation();
    this.tabClosed.emit(tab.id);

    if (this.activeTabId() === tab.id) {
      const remainingTabs = this.tabs().filter(t => t.id !== tab.id);
      this.activeTabId.set(remainingTabs.length > 0 ? remainingTabs[0].id : null);
    }
  }

  ngOnInit() {
    const tabs = this.tabs();
    const initialTab = this.initialActiveTabId();

    if (initialTab && tabs.find(t => t.id === initialTab)) {
      this.activeTabId.set(initialTab);
    } else if (tabs.length > 0) {
      this.activeTabId.set(tabs[0].id);
    }
  }

  closeDropdown(): void {
    if (this.isMobile()) {
      this.isDropdownOpen.set(false);
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.isDropdownOpen()) {
      this.isDropdownOpen.set(false);
    }
  }
}
