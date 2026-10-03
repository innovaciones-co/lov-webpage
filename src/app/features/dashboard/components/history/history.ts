import { Component, computed, inject, input, signal } from '@angular/core';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { Paginator } from '../../../../core/models/paginator.model';
import { DatetimePipe } from "../../../../core/pipes/datetime.pipe";
import { Loading } from "../../../../shared/components/loading/loading";
import { HistoryItem } from '../../models/history.model';
import { HistoryService } from '../../services/history.service';

type PresetHistoryRangeMonths = 1 | 3 | 6;
type HistoryRangeOption = PresetHistoryRangeMonths | 'custom';
type HistoryTone = 'data' | 'sms' | 'call' | 'other';

interface HistoryDayGroup {
  key: string;
  label: string;
  items: HistoryItem[];
}

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
    DATA: 'language',
    CALL: 'call',
    SMS: 'sms'
  };

  private readonly typeLabelMap: Record<string, string> = {
    DATA: 'Datos móviles',
    CALL: 'Llamada',
    SMS: 'Mensaje de texto'
  };

  private readonly timeFormatter = new Intl.DateTimeFormat('es-CO', { hour: 'numeric', minute: '2-digit' });
  private readonly dayFormatter = new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
  private readonly numberFormatter = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 });

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
  showCustomRange = signal(false);

  // The current page's events grouped by calendar day (newest first, as the API returns them),
  // so the list reads like a bank statement: "Hoy", "Ayer", "Martes, 30 de septiembre".
  groupedHistory = computed<HistoryDayGroup[]>(() => {
    const groups: HistoryDayGroup[] = [];
    for (const item of this.history$()?.content ?? []) {
      const date = new Date(item.date);
      const key = Number.isNaN(date.getTime()) ? 'unknown' : date.toDateString();
      let group = groups[groups.length - 1];
      if (!group || group.key !== key) {
        group = { key, label: this.formatDayLabel(date), items: [] };
        groups.push(group);
      }
      group.items.push(item);
    }
    return groups;
  });

  getTypeIcon(type: string): string {
    return this.typeIconMap[type?.toUpperCase?.()] ?? 'receipt_long';
  }

  getTypeTone(type: string): HistoryTone {
    const value = type?.toUpperCase?.();
    if (value === 'DATA') return 'data';
    if (value === 'SMS') return 'sms';
    if (value === 'CALL') return 'call';
    return 'other';
  }

  getTypeLabel(type: string): string {
    return this.typeLabelMap[type?.toUpperCase?.()] ?? 'Consumo';
  }

  formatTime(value: string): string {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : this.timeFormatter.format(date);
  }

  // Data comes in MB from CYAN; switch to GB once it's large enough to read better.
  formatAmount(item: HistoryItem): string {
    const amount = Number(item.amount ?? 0);
    const measure = (item.measure ?? '').trim();
    if (measure.toUpperCase() === 'MB' && amount >= 1024) {
      return `${this.numberFormatter.format(amount / 1024)} GB`;
    }
    return `${this.numberFormatter.format(amount)} ${measure}`.trim();
  }

  isZeroAmount(item: HistoryItem): boolean {
    return Number(item.amount ?? 0) === 0;
  }

  toggleCustomRange(): void {
    this.showCustomRange.update(open => !open);
    this.customDateError.set(null);
  }

  getTotalPages(): number {
    return this.history$()?.page?.totalPages ?? 0;
  }

  private formatDayLabel(date: Date): string {
    if (Number.isNaN(date.getTime())) {
      return 'Sin fecha';
    }
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return 'Hoy';
    if (date.toDateString() === yesterday.toDateString()) return 'Ayer';
    const label = this.dayFormatter.format(date);
    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  setDateRange(months: PresetHistoryRangeMonths): void {
    this.selectedRangeMonths.set(months);
    this.showCustomRange.set(false);
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
          new DatetimePipe().transform(item.date),
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
    const currentPage = this.history$()?.page?.number ?? this.currentPage();
    const maxVisiblePages = 5;
    const pagesBefore = Math.min(Math.floor(maxVisiblePages / 2), currentPage);
    let start = currentPage - pagesBefore;
    let end = Math.min(start + maxVisiblePages - 1, totalPages - 1);
    start = Math.max(end - maxVisiblePages + 1, 0);
    return Array.from({ length: Math.max(end - start + 1, 0) }, (_, index) => start + index);
  }

  hasMorePagesBefore(): boolean {
    const pageNumbers = this.getPageNumbers();
    const firstVisiblePage = pageNumbers[0] ?? 0;
    return firstVisiblePage > 0;
  }

  hasMorePagesAfter(): boolean {
    const totalPages = this.history$()?.page?.totalPages ?? 0;
    const pageNumbers = this.getPageNumbers();
    const lastVisiblePage = pageNumbers[pageNumbers.length - 1] ?? -1;
    return lastVisiblePage < totalPages - 1;
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
