import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PqrConfirmation } from "./componets/pqr-confirmation/pqr-confirmation";
import { PqrForm } from "./componets/pqr-form/pqr-form";

@Component({
  selector: 'app-pqr',
  imports: [CommonModule, PqrConfirmation, PqrForm],
  templateUrl: './pqr.html',
  styleUrl: './pqr.scss'
})
export class Pqr {
  pqrFormData = signal<any>(null);
  currentStepIndex = signal(0);

  nextStep(): void {
    if (this.currentStepIndex() < 1) { // 0, 1 (2 steps total)
      this.currentStepIndex.set(this.currentStepIndex() + 1);
    }
  }

  previousStep(): void {
    if (this.currentStepIndex() > 0) {
      this.currentStepIndex.set(this.currentStepIndex() - 1);
    }
  }

  onPqrFormSubmit(data: any): void {
    this.pqrFormData.set(data);
    console.log('PQR Form Data:', data);
    this.nextStep();
  }
}
