import { Component, signal } from '@angular/core';
import { IccidValidationForm, IccidValidationFormData } from "./components/iccid-validation-form/iccid-validation-form";
import { PersonalInfoFormData, PersonalInfoForm } from './components/personal-info-form/personal-info-form';
import { DocumentValidation, DocumentValidationData } from './components/document-validation/document-validation';

@Component({
  selector: 'app-activate-sim',
  imports: [IccidValidationForm, PersonalInfoForm, DocumentValidation],
  templateUrl: './activate-sim.html',
  styleUrl: './activate-sim.scss',
})
export class ActivateSim {

  iccidData = signal<IccidValidationFormData | null>(null);
  documentValidationData = signal<DocumentValidationData | null>(null);
  personalInfoFormData = signal<PersonalInfoFormData | null>(null);
  
  showDocumentValidationForm = signal(false);
  showPersonalInfoForm = signal(false);

  onIccidValidationFormSubmit(data: IccidValidationFormData): void {
    this.iccidData.set(data);
    this.showDocumentValidationForm.set(true);
    // console.log('ICCID Data:', data);
  }

  onDocumentValidationFormSubmit(data: DocumentValidationData): void {
    this.documentValidationData.set(data);
    this.showPersonalInfoForm.set(true);
    // console.log('Document Validation Data:', data);
  }

  onPersonalInfoFormSubmit(data: PersonalInfoFormData): void {
    this.personalInfoFormData.set(data);
    // console.log('personalInfo Data:', data);
  }

}
