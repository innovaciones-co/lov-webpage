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

  nickname(subscription: CustomerSubscription): string | null {
    return this.aliases().get(subscription.id)?.nickname || null;
  }

  /** The chosen color, or a stable default so each line looks different anyway. */
  color(subscription: CustomerSubscription): string {
    return this.aliases().get(subscription.id)?.color || DEFAULT_COLORS[subscription.id % DEFAULT_COLORS.length];
  }

  /** Two letters for the avatar: the name's initials, or the number's last two digits. */
  initials(subscription: CustomerSubscription): string {
    const name = this.nickname(subscription);
    if (!name) return subscription.msisdn.slice(-2);
    const words = name.trim().split(/\s+/);
    return (words.length > 1 ? words[0][0] + words[1][0] : name.slice(0, 2)).toUpperCase();
  }

  /** 573330513509 → 333 051 3509 */
  formatNumber(msisdn: string): string {
    const local = msisdn.startsWith('57') ? msisdn.slice(2) : msisdn;
    return local.length === 10 ? `${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}` : local;
  }
}
