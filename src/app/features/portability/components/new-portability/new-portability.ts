import { Component, effect, signal } from '@angular/core';
import { CustomerInformationData, CustomerInformationFormComponent } from '../customer-information-form/customer-information-form';
import { PortabilityInformation, PortabilityInformationData } from '../portability-information-form/portability-information-form.component';
import { DonorInformationData, DonorInformationFormComponent } from '../donor-information-form/donor-information-form.component';

// What the customer entered so far, so going back a step or reloading the page loses nothing.
// Per tab (sessionStorage) and cleared once the request is sent.
const DRAFT_KEY = 'lov.portability';

interface PortabilityDraft {
  step: number;
  portability: PortabilityInformationData | null;
  donor: DonorInformationData | null;
  customer: Partial<CustomerInformationData> | null;
}

@Component({
  selector: 'app-new-portability',
  templateUrl: './new-portability.html',
  styleUrl: './new-portability.scss',
  imports: [PortabilityInformation, DonorInformationFormComponent, CustomerInformationFormComponent]
})
export class NewPortabilityComponent {

  readonly steps = ['Tu SIM LOV', 'Número a traer', 'Tus datos'];

  portabilityData = signal<PortabilityInformationData | null>(null);
  donorData = signal<DonorInformationData | null>(null);
  customerDraft = signal<Partial<CustomerInformationData> | null>(null);

  currentStepIndex = signal(0);
  private finished = false;

  constructor() {
    this.restoreDraft();
    effect(() => {
      const draft: PortabilityDraft = {
        step: this.currentStepIndex(),
        portability: this.portabilityData(),
        donor: this.donorData(),
        customer: this.customerDraft(),
      };
      if (this.finished) return;
      try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft)); } catch { /* no storage (SSR, private mode) */ }
    });
  }

  nextStep(): void {
    if (this.currentStepIndex() < this.steps.length - 1) {
      this.currentStepIndex.update(step => step + 1);
    }
  }

  previousStep(): void {
    if (this.currentStepIndex() > 0) {
      this.currentStepIndex.update(step => step - 1);
    }
  }

  onPortabilityInformationSubmit(data: PortabilityInformationData): void {
    this.portabilityData.set(data);
    this.nextStep();
  }

  onDonorInformationSubmit(data: DonorInformationData): void {
    this.donorData.set(data);
    this.nextStep();
  }

  onCustomerDraftChange(data: Partial<CustomerInformationData>): void {
    this.customerDraft.set(data);
  }

  onCustomerInformationSubmit(): void {
    this.finished = true;
    try { sessionStorage.removeItem(DRAFT_KEY); } catch { /* no storage */ }
  }

  private restoreDraft(): void {
    let draft: PortabilityDraft | null = null;
    try { draft = JSON.parse(sessionStorage.getItem(DRAFT_KEY) ?? 'null'); } catch { return; }
    if (!draft) return;

    this.portabilityData.set(draft.portability ?? null);
    this.donorData.set(draft.donor ?? null);
    this.customerDraft.set(draft.customer ?? null);
    // Never past a step whose earlier data is missing.
    const reachable = !draft.portability ? 0 : !draft.donor ? 1 : 2;
    this.currentStepIndex.set(Math.min(draft.step ?? 0, reachable));
  }

}
