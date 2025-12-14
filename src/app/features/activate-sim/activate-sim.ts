import { Component, signal } from '@angular/core';
import { IccidValidationForm } from "./components/iccid-validation-form/iccid-validation-form";

@Component({
  selector: 'app-activate-sim',
  imports: [IccidValidationForm],
  templateUrl: './activate-sim.html',
  styleUrl: './activate-sim.scss',
})
export class ActivateSim {

  // iccidData = signal<IccidValidationData | null>(null);

  currentStepIndex = signal(0);

  nextStep(): void {
    if (this.currentStepIndex() < 0) { // 0, 1 (2 steps total)
      this.currentStepIndex.set(this.currentStepIndex() + 1);
    }
  }

  previousStep(): void {
    if (this.currentStepIndex() > 0) {
      this.currentStepIndex.set(this.currentStepIndex() - 1);
    }
  }

  onIccidValidationFormSubmit($event: Event) {
    /* this.iccidData.set(data);
    console.log('ICCID Data:', data); */
    this.nextStep();
  }

}
