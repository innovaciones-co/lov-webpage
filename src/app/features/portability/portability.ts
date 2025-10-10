import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputTextComponent } from '../../shared/components/form-fields/input-text/input-text';
import { SelectComponent } from '../../shared/components/form-fields/select/select';
import { RadioComponent } from '../../shared/components/form-fields/radio/radio';
import { CheckboxComponent } from '../../shared/components/form-fields/checkbox/checkbox';
import { DatePickerComponent } from '../../shared/components/form-fields/date-picker/date-picker';
import { NavigationTabsComponent } from "../../shared/components/navigation-tabs/navigation-tabs";

@Component({
  selector: 'app-portability',
  templateUrl: './portability.html',
  styleUrls: ['./portability.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextComponent,
    SelectComponent,
    RadioComponent,
    CheckboxComponent,
    DatePickerComponent,
    NavigationTabsComponent
  ],
})
export class Portability {
  form = signal(
    new FormGroup({
      name: new FormControl('', Validators.required),
      documentType: new FormControl('', Validators.required),
      gender: new FormControl('', Validators.required),
      terms: new FormControl(false, Validators.requiredTrue),
      birthdate: new FormControl('', Validators.required),
    })
  );

  tabs = [
    {
      id: 'input_name',
      title: 'Input',
      component: InputTextComponent,
      inputs: {
        label: 'Nombre completo',
        placeholder: 'Ingresa tu nombre',
        control: this.form().controls.name,
        error: 'Este campo es obligatorio'
      }
    },
    {
      id: 'input_surname',
      title: 'Input',
      component: InputTextComponent,
      inputs: {
        label: 'Apellido completo',
        placeholder: 'Ingresa tu apellido',
        control: this.form().controls.name,
        error: 'Este campo es obligatorio'
      }
    },
  ];

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
