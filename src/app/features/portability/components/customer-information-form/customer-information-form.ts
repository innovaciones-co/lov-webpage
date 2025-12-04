import { Component, signal } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CheckboxComponent } from '../../../../shared/components/form-fields/checkbox/checkbox';
import { DatePickerComponent } from '../../../../shared/components/form-fields/date-picker/date-picker';
import { InputTextComponent } from '../../../../shared/components/form-fields/input-text/input-text';
import { SelectComponent } from "../../../../shared/components/form-fields/select/select";

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
      addressOptional: new FormControl('', Validators.required),
    })
  );

  /* donorOperator = signal([
    { label: 'Claro', value: 'claro' },
    { label: 'Tigo', value: 'tigo' },
  ]); */

  documentType = signal([
    { label: 'Cédula', value: 'ID' },
    { label: 'Cédula de extranjeria', value: 'foreignID' },
  ]);

  country = signal([
    { label: 'Colombia', value: 'colombia' },
  ]);

}
