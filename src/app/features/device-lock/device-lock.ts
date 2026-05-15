import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PersonalInfoForm, PersonalInfoFormData } from "./components/personal-info-form/personal-info-form";
import { IncidentInfoForm, IncidentInfoFormData } from "./components/incident-info-form/incident-info-form";

@Component({
  selector: 'app-device-lock',
  imports: [CommonModule, PersonalInfoForm, IncidentInfoForm],
  templateUrl: './device-lock.html',
  styleUrl: './device-lock.scss'
})
export class DeviceLock {

  incidentInfoFormData = signal<IncidentInfoFormData | null>(null);
  personalInfoFormData = signal<PersonalInfoFormData | null>(null);
  subscriberData = signal<any>(null);

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

  onIncidentInfoFormSubmit(data: IncidentInfoFormData, subscriber: any = null): void {
    this.incidentInfoFormData.set(data);
    if (subscriber) {
      this.subscriberData.set(subscriber);
    }
    console.log('Incident Info Data:', data);
    console.log('Subscriber Data:', subscriber);
    this.nextStep();
  }

  onPersonalInfoFormSubmit(data: PersonalInfoFormData): void {
    this.personalInfoFormData.set(data);
    console.log('Personal Info Data:', data);
    console.log('All Form Data:', {
      incidentInfo: this.incidentInfoFormData(),
      personalInfo: this.personalInfoFormData()
    });
    // Here you can submit all the data to your backend
  }

}
