import { Component, DestroyRef, inject, PLATFORM_ID, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { isPlatformBrowser } from '@angular/common';
import { SuccessfulProcessComponent } from '../../../../shared/components/successful-process/successful-process';
import { ActivateSimService } from '../../services/activate-sim.service';
import { retry, timer } from 'rxjs';

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

  icon = '/email.png';
  title = '¡Tu SIM ha sido activada exitosamente!';

  msisdnState = signal<'idle' | 'loading' | 'success' | 'error'>('idle');
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
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response) => this.handleSuccess(response),
        error: (error) => this.handleError(error)
      });
  }

  private handleSuccess(response: any): void {
    if (response?.payload?.subscriptions?.[0]?.msisdn) {
      const msisdnValue = response.payload.subscriptions[0].msisdn;
      const formattedMsisdn = msisdnValue.startsWith('57')
        ? msisdnValue.substring(2)
        : msisdnValue;

      this.msisdn.set(formattedMsisdn);
      this.msisdnState.set('success');
    }
  }

  private handleError(error: any): void {
    this.msisdnState.set('error');
    this.msisdn.set(null);
  }
}
