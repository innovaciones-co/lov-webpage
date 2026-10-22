import { Component, computed, signal } from '@angular/core';
import { DocumentValidation, DocumentValidationData } from './components/document-validation/document-validation';
import { IccidValidationForm, IccidValidationFormData } from "./components/iccid-validation-form/iccid-validation-form";
import { PersonalInfoForm, PersonalInfoFormData } from './components/personal-info-form/personal-info-form';
import { PageHeader } from '../../shared/components/page-header/page-header';

@Component({
  selector: 'app-activate-sim',
  imports: [IccidValidationForm, PersonalInfoForm, DocumentValidation, PageHeader],
  templateUrl: './activate-sim.html',
  styleUrl: './activate-sim.scss',
})
export class ActivateSim {

  iccidData = signal<IccidValidationFormData | null>(null);
  documentValidationData = signal<DocumentValidationData | null>(null);
  personalInfoFormData = signal<PersonalInfoFormData | null>(null);

  showDocumentValidationForm = signal(false);
  showPersonalInfoForm = signal(false);

  readonly steps = [
    { n: 1, label: 'Tu SIM' },
    { n: 2, label: 'Tu documento' },
    { n: 3, label: 'Tus datos' },
  ];
  readonly currentStep = computed(() => this.showPersonalInfoForm() ? 3 : this.showDocumentValidationForm() ? 2 : 1);

  onIccidValidationFormSubmit(data: IccidValidationFormData): void {
    this.iccidData.set(data);
    this.showDocumentValidationForm.set(true);
  }

  onDocumentValidationFormSubmit(data: DocumentValidationData): void {
    this.documentValidationData.set(data);
    this.showPersonalInfoForm.set(true);
  }

  onPersonalInfoFormSubmit(data: PersonalInfoFormData): void {
    this.personalInfoFormData.set(data);
  }

}
