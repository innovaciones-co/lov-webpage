import { Component, inject, input, signal } from '@angular/core';
import { Loading } from "../../../../shared/components/loading/loading";
import { HistoryService } from '../../services/history.service';

type HistoryRangeMonths = 1 | 3 | 6;

@Component({
  selector: 'app-history',
  imports: [Loading],
  templateUrl: './history.html',
  styleUrl: './history.scss'
})
export class History {
  subscriberId = input.required<number>();
  private readonly pageSize = 10;

  private readonly typeIconMap: Record<string, string> = {
    DATA: 'signal_cellular_alt',
    CALL: 'call',
    SMS: 'sms'
  };

  private historyService = inject(HistoryService);
  history$ = this.historyService.getHistorySignal();
  loading$ = this.historyService.getLoadingSignal();
  error$ = this.historyService.getErrorSignal();
  currentPage = signal(0);
  selectedRangeMonths = signal<HistoryRangeMonths>(1);

  getTypeIcon(type: string): string {
    return this.typeIconMap[type?.toUpperCase?.()] ?? 'help';
  }

  setDateRange(months: HistoryRangeMonths): void {
    this.selectedRangeMonths.set(months);
    this.currentPage.set(0);
    this.fetchHistory();
  }

  isDateRangeSelected(months: HistoryRangeMonths): boolean {
    return this.selectedRangeMonths() === months;
  }

  getPageNumbers(): number[] {
    const totalPages = this.history$()?.page?.totalPages ?? 0;
    return Array.from({ length: totalPages }, (_, index) => index);
  }

  hasPreviousPage(): boolean {
    const currentPage = this.history$()?.page?.number ?? this.currentPage();
    return currentPage > 0;
  }

  hasNextPage(): boolean {
    const page = this.history$()?.page;
    if (!page) {
      return false;
    }
    return page.number < page.totalPages - 1;
  }

  changePage(page: number): void {
    const totalPages = this.history$()?.page?.totalPages ?? 0;
    if (page < 0 || page >= totalPages || page === this.currentPage()) {
      return;
    }

    this.currentPage.set(page);
    this.fetchHistory();
  }

  private getDateRange(months: number): { startDate: Date; endDate: Date } {
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setMonth(startDate.getMonth() - months);
    return { startDate, endDate };
  }

  private fetchHistory(): void {
    const { startDate, endDate } = this.getDateRange(this.selectedRangeMonths());

    this.historyService
      .getHistory(this.subscriberId(), this.pageSize, this.currentPage(), startDate, endDate)
      .subscribe({
        next: (history) => {
          this.currentPage.set(history.page.number);
          console.log('Subscriber history:', history);
        },
        error: (error) => {
          console.error('Error fetching subscriber history:', error);
        }
      });
  }

  ngOnInit() {
    this.fetchHistory();
  }
}
