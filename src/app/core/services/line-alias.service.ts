import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { catchError, Observable, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CustomerSubscription } from '../models/customer.model';

export interface LineAlias {
  subscriberId: number;
  nickname?: string | null;
  color?: string | null;
}

// LOV brand palette (corporate + complementary colors from the brand manual).
const VIEWING_KEY = 'lov.viewingLine';

// Defaults skip yellow and gray, which read as warning and disabled.
const DEFAULT_COLORS = ['#066EF1', '#00A0FF', '#6C00BB', '#FF4600', '#052B6C'];

export const LINE_COLORS = ['#066EF1', '#00A0FF', '#052B6C', '#6C00BB', '#FF0000', '#FF4600', '#FFB400', '#757A8C'];

/**
 * The name and color customers give their lines ("Mamá", in purple...), saved in the backend
 * so they show the same on every device, in Mi cuenta and when choosing a line to recharge.
 */
@Injectable({ providedIn: 'root' })
export class LineAliasService {
  private readonly http = inject(HttpClient);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly url = `${environment.apiUrl}/lineAliases`;
  private loaded = false;

  readonly aliases = signal<Map<number, LineAlias>>(new Map());

  /**
   * The line the customer is looking at in Mi cuenta, so paying for a plan or a recharge from
   * there starts on that same line. Kept for the browser tab's session only.
   */
  get viewingLineId(): number | null {
    return this.viewingLine()?.id ?? null;
  }

  /** That line's number without the country code (3330513509), to pre-fill a recharge. */
  get viewingMsisdn(): string | null {
    const msisdn = this.viewingLine()?.msisdn;
    return msisdn ? (msisdn.startsWith('57') ? msisdn.slice(2) : msisdn) : null;
  }

  setViewingLine(subscription: CustomerSubscription): void {
    if (!this.isBrowser) return;
    try {
      sessionStorage.setItem(VIEWING_KEY, JSON.stringify({ id: subscription.id, msisdn: subscription.msisdn }));
    } catch {
      // Storage blocked (private mode): payments just start on the first line.
    }
  }

  /** Loads once per session; signed-out visitors (401) just keep plain numbers. */
  load(): void {
    if (!this.isBrowser || this.loaded) return;
    this.loaded = true;
    this.http.get<LineAlias[]>(this.url).pipe(catchError(() => of([] as LineAlias[])))
      .subscribe(list => this.aliases.set(new Map(list.map(alias => [alias.subscriberId, alias]))));
  }

  save(subscriberId: number, nickname: string | null, color: string | null): Observable<LineAlias> {
    return this.http.put<LineAlias>(`${this.url}/${subscriberId}`, { nickname, color }).pipe(
      tap(saved => this.aliases.update(current => new Map(current).set(subscriberId, saved)))
    );
  }

  private viewingLine(): { id: number; msisdn: string } | null {
    if (!this.isBrowser) return null;
    try {
      return JSON.parse(sessionStorage.getItem(VIEWING_KEY) ?? 'null');
    } catch {
      return null;
    }
  }

  nickname(subscription: CustomerSubscription): string | null {
    return this.aliases().get(subscription.id)?.nickname || null;
  }

  /** The chosen color, or a stable default so each line looks different anyway. */
  color(subscription: CustomerSubscription): string {
    return this.aliases().get(subscription.id)?.color || DEFAULT_COLORS[subscription.id % DEFAULT_COLORS.length];
  }

  /** 573330513509 → 333 051 3509 */
  formatNumber(msisdn: string): string {
    const local = msisdn.startsWith('57') ? msisdn.slice(2) : msisdn;
    return local.length === 10 ? `${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}` : local;
  }
}
