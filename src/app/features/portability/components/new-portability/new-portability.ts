import { Component, signal, computed, Type } from '@angular/core';
import { PortabilityInformation, PortabilityInformationData } from '../portability-information-form/portability-information-form.component';
import { PortinInformationFormComponent, PortinInformationData } from '../portin-information-form/portin-information-form.component';
import { CustomerInformationFormComponent, CustomerInformationData } from '../customer-information-form/customer-information-form';

interface Step {
  label: string;
  component: Type<any>;
  completed?: boolean;
}

@Component({
  selector: 'app-new-portability',
  templateUrl: './new-portability.html',
  styleUrl: './new-portability.scss',
  imports: [PortabilityInformation, PortinInformationFormComponent, CustomerInformationFormComponent]
})
export class NewPortabilityComponent {

  portabilityData = signal<PortabilityInformationData | null>(null);
  portinData = signal<PortinInformationData | null>(null);
  customerData = signal<CustomerInformationData | null>(null);

  steps: Step[] = [
    { label: 'Info Portabilidad', component: PortabilityInformation, completed: false },
    { label: 'Formulario Portabilidad', component: PortinInformationFormComponent, completed: false },
    { label: 'Info cliente', component: CustomerInformationFormComponent, completed: false },
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

  onPortabilityInformationSubmit(data: PortabilityInformationData): void {
    this.portabilityData.set(data);
    console.log('Portability Information Data:', data);
    this.nextStep();
  }

  onPortinInformationSubmit(data: PortinInformationData): void {
    this.portinData.set(data);
    console.log('Portin Information Data:', data);
    this.nextStep();
  }

  onCustomerInformationSubmit(data: CustomerInformationData): void {
    this.customerData.set(data);
    console.log('Customer Information Data:', data);
    console.log('All Form Data:', {
      portability: this.portabilityData(),
      portin: this.portinData(),
      customer: this.customerData()
    });
    // Here you can submit all the data to your backend
  }

}
