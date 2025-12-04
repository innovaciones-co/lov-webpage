import { Component, signal, output } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CheckboxComponent } from '../../../../shared/components/form-fields/checkbox/checkbox';
import { DatePickerComponent } from '../../../../shared/components/form-fields/date-picker/date-picker';
import { InputTextComponent } from '../../../../shared/components/form-fields/input-text/input-text';
import { SelectComponent } from "../../../../shared/components/form-fields/select/select";

export interface CustomerInformationData {
  name: string;
  lastName: string;
  documentType: string;
  documentID: string;
  email: string;
  phoneNumber: string;
  country: string;
  city: string;
  address: string;
  addressOptional: string;
}

@Component({
  selector: 'app-customer-information-form',
  imports: [
    ReactiveFormsModule,
    InputTextComponent,
    SelectComponent
  ],
  templateUrl: './customer-information-form.html',
  styleUrl: './customer-information-form.scss'
})
export class CustomerInformationFormComponent {

  form = signal(
    new FormGroup({
      name: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      documentType: new FormControl('', Validators.required),
      documentID: new FormControl('', Validators.required),
      email: new FormControl('', Validators.required),
      phoneNumber: new FormControl('', Validators.required),
      country: new FormControl('', Validators.required),
      city: new FormControl('', Validators.required),
      address: new FormControl('', Validators.required),
      addressOptional: new FormControl(''),
    })
  );

  documentType = signal([
    { label: 'Cédula', value: 'ID' },
    { label: 'Cédula de extranjeria', value: 'foreignID' },
  ]);

  country = signal([
    { label: 'Colombia', value: 'colombia' },
  ]);

  formSubmit = output<CustomerInformationData>();

  onSubmit(): void {
    if (this.form().valid) {
      this.formSubmit.emit(this.form().value as CustomerInformationData);
    }
  }

}
