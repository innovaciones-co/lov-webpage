import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Paginator } from '../../../core/models/paginator.model';
import { HistoryItem } from '../models/history.model';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private http = inject(HttpClient);
  private readonly apiUrl;

  private loading = signal<boolean>(false);
  private history = signal<Paginator<HistoryItem> | null>(null);
  private error = signal<string | null>(null);

  constructor() {
    this.apiUrl = environment.apiUrl;
  }

  getHistory(
    subscriberId: number,
    size = 100,
    page = 0,
    startDate?: Date,
    endDate?: Date,
    updateState = true
  ): Observable<Paginator<HistoryItem>> {
    if (updateState) {
      this.loading.set(true);
      this.error.set(null);
    }

    const normalizedSubscriberId = String(subscriberId);
    let params = new HttpParams()
      .set('size', size)
      .set('page', page)
      .set('subscriberId', normalizedSubscriberId);

    if (startDate) {
      params = params.set('startDate', startDate.toISOString());
    }

    if (endDate) {
      params = params.set('endDate', endDate.toISOString());
    }

    const url = `${this.apiUrl}/history/${normalizedSubscriberId}`

    return this.http.get<Paginator<HistoryItem>>(url, { params }).pipe(
      tap((response) => {
        if (updateState) {
          this.history.set(response);
        }
      }),
      catchError((error) => {
        if (updateState) {
          this.error.set(error.message ?? 'Unable to fetch subscriber history');
        }
        return throwError(() => error);
      }),
      finalize(() => {
        if (updateState) {
          this.loading.set(false);
        }
      })
    );
  }

  getLoadingSignal() {
    return this.loading.asReadonly();
  }

  getHistorySignal() {
    return this.history.asReadonly();
  }

  getErrorSignal() {
    return this.error.asReadonly();
  }
}
