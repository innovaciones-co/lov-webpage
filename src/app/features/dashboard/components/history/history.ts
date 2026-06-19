import { Component, inject, input, signal } from '@angular/core';
import { Paginator } from '../../../../core/models/paginator.model';
import { HistoryItem } from '../../models/history.model';
import { Loading } from "../../../../shared/components/loading/loading";
import { HistoryService } from '../../services/history.service';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';

type PresetHistoryRangeMonths = 1 | 3 | 6;
type HistoryRangeOption = PresetHistoryRangeMonths | 'custom';

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
  selectedRangeMonths = signal<HistoryRangeOption>(1);
  customStartDate = signal('');
  customEndDate = signal('');
  customDateError = signal<string | null>(null);
  exportingCsv = signal(false);

  getTypeIcon(type: string): string {
    return this.typeIconMap[type?.toUpperCase?.()] ?? 'help';
  }

  setDateRange(months: PresetHistoryRangeMonths): void {
    this.selectedRangeMonths.set(months);
    this.customDateError.set(null);
    this.currentPage.set(0);
    this.fetchHistory();
  }

  isDateRangeSelected(months: HistoryRangeOption): boolean {
    return this.selectedRangeMonths() === months;
  }

  onCustomStartDateChange(value: string): void {
    this.customStartDate.set(value);
    this.customDateError.set(null);
  }

  onCustomEndDateChange(value: string): void {
    this.customEndDate.set(value);
    this.customDateError.set(null);
  }

  applyCustomDateRange(): void {
    const startDate = this.parseDateInput(this.customStartDate(), false);
    const endDate = this.parseDateInput(this.customEndDate(), true);

    if (!startDate || !endDate) {
      this.customDateError.set('Selecciona una fecha inicial y final validas.');
      return;
    }

    if (startDate > endDate) {
      this.customDateError.set('La fecha inicial no puede ser mayor que la fecha final.');
      return;
    }

    this.selectedRangeMonths.set('custom');
    this.customDateError.set(null);
    this.currentPage.set(0);
    this.fetchHistory();
  }

  downloadCurrentHistoryAsCsv(): void {
    if (typeof window === 'undefined' || this.exportingCsv()) {
      return;
    }

    this.exportingCsv.set(true);

    this.fetchAllHistoryRows().subscribe({
      next: (rows) => {
        if (rows.length === 0) {
          return;
        }

        const headers = ['Fecha', 'Tipo', 'Detalle', 'Cantidad', 'Unidad'];
        const dataRows = rows.map((item) => [
          item.date,
          item.type,
          item.detail,
          String(item.amount ?? ''),
          item.measure
        ]);

        const csvBody = [headers, ...dataRows]
          .map((row) => row.map((value) => this.escapeCsvValue(value)).join(','))
          .join('\n');

        const blob = new Blob([csvBody], { type: 'text/csv;charset=utf-8;' });
        const fileName = `historial-consumo-${this.buildExportDateSuffix()}.csv`;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error exporting subscriber history CSV:', error);
        this.exportingCsv.set(false);
      },
      complete: () => {
        this.exportingCsv.set(false);
      }
    });
  }

  private fetchAllHistoryRows(): Observable<HistoryItem[]> {
    const { startDate, endDate } = this.getCurrentDateRange();

    return this.historyService
      .getHistory(this.subscriberId(), this.pageSize, 0, startDate, endDate, false)
      .pipe(
        switchMap((firstPage) => {
          const totalPages = firstPage.page?.totalPages ?? 1;
          if (totalPages <= 1) {
            return of(firstPage.content ?? []);
          }

          const remainingPageRequests = Array.from({ length: totalPages - 1 }, (_, index) =>
            this.historyService.getHistory(this.subscriberId(), this.pageSize, index + 1, startDate, endDate, false)
          );

          return forkJoin(remainingPageRequests).pipe(
            map((remainingPages) => {
              const allPages: Array<Paginator<HistoryItem>> = [firstPage, ...remainingPages];
              return allPages.flatMap((page) => page.content ?? []);
            })
          );
        })
      );
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

  private getCurrentDateRange(): { startDate: Date; endDate: Date } {
    const selectedRange = this.selectedRangeMonths();

    if (selectedRange !== 'custom') {
      return this.getDateRange(selectedRange);
    }

    const startDate = this.parseDateInput(this.customStartDate(), false);
    const endDate = this.parseDateInput(this.customEndDate(), true);

    if (!startDate || !endDate) {
      return this.getDateRange(1);
    }

    return { startDate, endDate };
  }

  private parseDateInput(dateValue: string, endOfDay: boolean): Date | null {
    if (!dateValue) {
      return null;
    }

    const dateParts = dateValue.split('-');
    if (dateParts.length !== 3) {
      return null;
    }

    const [yearText, monthText, dayText] = dateParts;
    const year = Number(yearText);
    const month = Number(monthText);
    const day = Number(dayText);

    if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
      return null;
    }

    const hours = endOfDay ? 23 : 0;
    const minutes = endOfDay ? 59 : 0;
    const seconds = endOfDay ? 59 : 0;
    const milliseconds = endOfDay ? 999 : 0;

    const parsedDate = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds, milliseconds));
    if (Number.isNaN(parsedDate.getTime())) {
      return null;
    }

    return parsedDate;
  }

  private toDateInputValue(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private escapeCsvValue(value: unknown): string {
    const serialized = String(value ?? '').replace(/"/g, '""');
    return `"${serialized}"`;
  }

  private buildExportDateSuffix(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  private fetchHistory(): void {
    const { startDate, endDate } = this.getCurrentDateRange();

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
    const { startDate, endDate } = this.getDateRange(1);
    this.customStartDate.set(this.toDateInputValue(startDate));
    this.customEndDate.set(this.toDateInputValue(endDate));
    this.fetchHistory();
  }
}
