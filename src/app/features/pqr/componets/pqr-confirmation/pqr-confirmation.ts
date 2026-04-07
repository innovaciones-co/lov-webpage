import { Component, inject, signal } from '@angular/core';
import { SuccessfulProcessComponent } from "../../../../shared/components/successful-process/successful-process";
import { PqrService } from '../../Services/pqr.service';

@Component({
  selector: 'app-pqr-confirmation',
  imports: [SuccessfulProcessComponent],
  templateUrl: './pqr-confirmation.html',
  styleUrl: './pqr-confirmation.scss'
})
export class PqrConfirmation {
  private pqrService = inject(PqrService);
  
  icon = '/email.png';
  title = '¡Tu solicitud ha sido enviada!';
  requestNumber = signal<string>('');

  constructor() {
    const result = this.pqrService.submissionResult();
    if (result?.id) {
      this.requestNumber.set(result.id);
    }
  }
}
