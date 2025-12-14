import { Component, signal } from '@angular/core';
import { IccidValidationForm, IccidValidationFormData } from "./components/iccid-validation-form/iccid-validation-form";
import { PersonalInfoFormData, PersonalInfoForm } from './components/personal-info-form/personal-info-form';

@Component({
  selector: 'app-activate-sim',
  imports: [IccidValidationForm, PersonalInfoForm],
  templateUrl: './activate-sim.html',
  styleUrl: './activate-sim.scss',
})
export class ActivateSim {

  iccidData = signal<IccidValidationFormData | null>(null);
  personalInfoFormData = signal<PersonalInfoFormData | null>(null);
  showPersonalInfoForm = signal(false);

  onIccidValidationFormSubmit(data: IccidValidationFormData): void {
    this.iccidData.set(data);
    this.showPersonalInfoForm.set(true);
    // console.log('ICCID Data:', data);
  }

  onPersonalInfoFormSubmit(data: PersonalInfoFormData): void {
    this.personalInfoFormData.set(data);
    // console.log('personalInfo Data:', data);
  }

}
