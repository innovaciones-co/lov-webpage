import { Component, signal } from '@angular/core';
import { IccidValidationForm } from "./components/iccid-validation-form/iccid-validation-form";
import { ActivateSimForm } from './components/activate-sim-form/activate-sim-form';

@Component({
  selector: 'app-activate-sim',
  imports: [IccidValidationForm, ActivateSimForm],
  templateUrl: './activate-sim.html',
  styleUrl: './activate-sim.scss',
})
export class ActivateSim {

  // iccidData = signal<IccidValidationData | null>(null);
  // activateSimData = signal<ActivateSimData | null>(null);

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

  onIccidValidationFormSubmit($event: Event) {
    /* this.iccidData.set(data);
    console.log('ICCID Data:', data); */
    this.nextStep();
  }

  onActivateSimFormSubmit($event: Event) {
    /* this.activateSimData.set(data);
    console.log('ActivateSim Data:', data); */
    this.nextStep();
  }

}
