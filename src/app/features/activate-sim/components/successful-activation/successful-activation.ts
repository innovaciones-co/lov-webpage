import { Component, DestroyRef, inject, PLATFORM_ID, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { isPlatformBrowser } from '@angular/common';
import { SuccessfulProcessComponent } from '../../../../shared/components/successful-process/successful-process';
import { ActivateSimService } from '../../services/activate-sim.service';
import { filter, map, repeat, retry, take, timeout, timer } from 'rxjs';

@Component({
  selector: 'app-successful-activation',
  imports: [SuccessfulProcessComponent],
  templateUrl: './successful-activation.html',
  styleUrl: './successful-activation.scss'
})
export class SuccessfulActivation {
  private platformId = inject(PLATFORM_ID);
  private activateSimService = inject(ActivateSimService);
  private destroyRef = inject(DestroyRef);

  private readonly INITIAL_DELAY = 5000; // 5 segundos
  private readonly MAX_ATTEMPTS = 4; // Total de intentos (1 inicial + 3 reintentos)
  private readonly RETRY_DELAYS = this.generateRetryDelays();
  private readonly MAX_RETRIES = this.RETRY_DELAYS.length;
  // Right after activating, CYAN still shows a temporary number for a while: ask again until
  // the line has its own, for up to WAIT_LIMIT.
  private readonly POLL_EVERY = 5000;
  private readonly WAIT_LIMIT = 4 * 60 * 1000;

  icon = '/email.png';
  title = '¡Tu SIM ha sido activada exitosamente!';

  // 'slow': the number wasn't ready in time (or couldn't be read); it'll arrive by SMS.
  msisdnState = signal<'idle' | 'loading' | 'success' | 'slow'>('idle');
  msisdn = signal<string | null>(null);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const iccidValue = history.state?.iccid;
      if (iccidValue) {
        this.fetchMsisdn(iccidValue);
      }
    }
  }

  private generateRetryDelays(): number[] {
    const delays: number[] = [];
    for (let i = 0; i < this.MAX_ATTEMPTS - 1; i++) {
      delays.push(this.INITIAL_DELAY * Math.pow(2, i));
    }
    return delays;
  }

  private fetchMsisdn(iccidValue: string): void {
    this.msisdnState.set('loading');

    this.activateSimService.getSubscriptionsByIccid(iccidValue)
      .pipe(
        retry({
          count: this.MAX_RETRIES,
          delay: (error, retryCount) => {
            return timer(this.RETRY_DELAYS[retryCount]);
          }
        }),
        map((response) => this.finalNumber(response?.payload?.subscriptions?.[0]?.msisdn)),
        repeat({ delay: this.POLL_EVERY }),
        filter((number): number is string => !!number),
        take(1),
        timeout({ first: this.WAIT_LIMIT }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (number) => {
          this.msisdn.set(number);
          this.msisdnState.set('success');
        },
        error: () => {
          this.msisdn.set(null);
          this.msisdnState.set('slow');
        }
      });
  }

  /** The line's number without 57, or null while it's still the temporary one (like 39960020574). */
  private finalNumber(msisdn: unknown): string | null {
    if (typeof msisdn !== 'string') return null;
    const number = msisdn.startsWith('57') ? msisdn.substring(2) : msisdn;
    // A Colombian mobile number: 10 digits starting with 3. The temporary ones start with 399.
    return /^3[0-9]{9}$/.test(number) && !number.startsWith('399') ? number : null;
  }
}
