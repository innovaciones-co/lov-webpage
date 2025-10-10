import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextComponent } from '../../../../shared/components/form-fields/input-text/input-text';
import { SelectComponent } from '../../../../shared/components/form-fields/select/select';
import { RadioComponent } from '../../../../shared/components/form-fields/radio/radio';
import { CheckboxComponent } from '../../../../shared/components/form-fields/checkbox/checkbox';
import { DatePickerComponent } from '../../../../shared/components/form-fields/date-picker/date-picker';

@Component({
  selector: 'app-new-portability',
  templateUrl: './new-portability.html',
  styleUrl: './new-portability.scss',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextComponent,
    SelectComponent,
    RadioComponent,
    CheckboxComponent,
    DatePickerComponent,
  ]
})
export class NewPortabilityComponent {
  form = signal(
    new FormGroup({
      name: new FormControl('', Validators.required),
      documentType: new FormControl('', Validators.required),
      gender: new FormControl('', Validators.required),
      terms: new FormControl(false, Validators.requiredTrue),
      birthdate: new FormControl('', Validators.required),
    })
  );

  documentOptions = signal([
    { label: 'DNI', value: 'dni' },
    { label: 'Pasaporte', value: 'passport' },
    { label: 'Cédula', value: 'cedula' },
  ]);

  genderOptions = signal([
    { label: 'Femenino', value: 'female' },
    { label: 'Masculino', value: 'male' },
    { label: 'Otro', value: 'other' },
  ]);
}
