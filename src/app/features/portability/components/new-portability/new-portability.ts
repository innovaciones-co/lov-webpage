import { Component, signal, computed, Type } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { NipRequestFormComponent } from '../nip-request-form/nip-request-form.component';
import { PortinRequestFormComponent } from '../portin-request-form/portin-request-form.component';

interface Step {
  label: string;
  component: Type<any>;
  completed?: boolean;
}

@Component({
  selector: 'app-new-portability',
  templateUrl: './new-portability.html',
  styleUrl: './new-portability.scss',
  imports: [NgComponentOutlet]
})
export class NewPortabilityComponent {

  steps: Step[] = [
    { label: 'Solicitud NIP', component: NipRequestFormComponent, completed: false },
    { label: 'Formulario Portabilidad', component: PortinRequestFormComponent, completed: false },
  ];

  currentStepIndex = signal(0);

  currentStep = computed(() => this.steps[this.currentStepIndex()]);

  isStepCompleted(stepIndex: number): boolean {
    return this.steps[stepIndex].completed || false;
  }

  isStepActive(stepIndex: number): boolean {
    return this.currentStepIndex() === stepIndex;
  }

  canNavigateToStep(stepIndex: number): boolean {
    // Can navigate to current step, next step, or any completed step
    return stepIndex <= this.currentStepIndex() + 1 || this.isStepCompleted(stepIndex);
  }

  selectStep(stepIndex: number): void {
    if (this.canNavigateToStep(stepIndex)) {
      this.currentStepIndex.set(stepIndex);
    }
  }

  nextStep(): void {
    if (this.currentStepIndex() < this.steps.length - 1) {
      // Mark current step as completed when moving to next
      this.steps[this.currentStepIndex()].completed = true;
      this.currentStepIndex.set(this.currentStepIndex() + 1);
    }
  }

  previousStep(): void {
    if (this.currentStepIndex() > 0) {
      this.currentStepIndex.set(this.currentStepIndex() - 1);
    }
  }

}
