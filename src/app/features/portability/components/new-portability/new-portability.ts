import { Component, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
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
  private router = inject(Router);

  readonly steps = ['Tu SIM LOV', 'Número a traer', 'Tus datos'];

  portabilityData = signal<PortabilityInformationData | null>(null);
  donorData = signal<DonorInformationData | null>(null);
  customerDraft = signal<Partial<CustomerInformationData> | null>(null);

  currentStepIndex = signal(0);
  private finished = false;

  constructor() {
    this.restoreDraft();
    this.startFromActivation();
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

  /**
   * Coming from "Inicia una portabilidad" right after activating a SIM: the first step starts
   * with that SIM's LOV number and serial digits. The customer still presses Continuar, which
   * validates the SIM. A draft for another number is dropped; one for this number is kept.
   */
  private startFromActivation(): void {
    let state: { lovNumber?: unknown; iccidDigits?: unknown } | null = null;
    try {
      // During the navigation the state is on the router; after a reload, in history.
      state = this.router.getCurrentNavigation()?.extras?.state
        ?? (typeof history !== 'undefined' ? history.state : null);
    } catch { return; }
    const lovNumber = typeof state?.lovNumber === 'string' && /^333[0-9]{7}$/.test(state.lovNumber) ? state.lovNumber : '';
    const iccidDigits = typeof state?.iccidDigits === 'string' && /^[0-9]{5}$/.test(state.iccidDigits) ? state.iccidDigits : '';
    if (!lovNumber && !iccidDigits) return;
    // Reloading the page keeps the router state: never wipe progress already made for it.
    const current = this.portabilityData();
    if (current && (!lovNumber || current.lovNumber === lovNumber)) return;

    this.portabilityData.set({ lovNumber, iccidDigits });
    this.donorData.set(null);
    this.customerDraft.set(null);
    this.currentStepIndex.set(0);
  }

}
