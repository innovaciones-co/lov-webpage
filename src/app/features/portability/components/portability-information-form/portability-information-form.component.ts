import { Component, signal, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextComponent } from '../../../../shared/components/form-fields/input-text/input-text';
import { SelectComponent } from '../../../../shared/components/form-fields/select/select';

export interface PortabilityInformationData {
  donorNumber: string;
  iccidDigits: string;
}

@Component({
  selector: 'app-portability-information-form',
  standalone: true,
  imports: [ReactiveFormsModule, InputTextComponent],
  templateUrl: './portability-information-form.component.html',
  styleUrl: './portability-information-form.component.scss'
})
export class PortabilityInformation {

  form = signal(
    new FormGroup({
      donorNumber: new FormControl(''),
      iccidDigits: new FormControl('')//, [Validators.required, Validators.pattern('^[0-9]{5}$')]),
    })
  );

  formSubmit = output<PortabilityInformationData>();

  onSubmit(): void {
    if (this.form().valid) {
      this.formSubmit.emit(this.form().value as PortabilityInformationData);
    }
    console.log('Form submitted:', this.form().value);
  }

}
