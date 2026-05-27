import { Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SuccessfulProcessComponent } from '../../../../shared/components/successful-process/successful-process';

@Component({
  selector: 'app-successful-activation',
  imports: [SuccessfulProcessComponent],
  templateUrl: './successful-activation.html',
  styleUrl: './successful-activation.scss'
})
export class SuccessfulActivation {
  private platformId = inject(PLATFORM_ID);
  icon = '/email.png';
  title = '¡Tu SIM ha sido activada exitosamente!';
  msisdn = signal<string | null>(null);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const msisdnValue = history.state?.msisdn;
      const formattedMsisdn = msisdnValue?.startsWith('57') ? msisdnValue.substring(2) : msisdnValue;
      this.msisdn.set(formattedMsisdn || null);
    }
  }
}
