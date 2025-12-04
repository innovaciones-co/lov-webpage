import { Component, signal } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CheckboxComponent } from '../../../../shared/components/form-fields/checkbox/checkbox';
import { DatePickerComponent } from '../../../../shared/components/form-fields/date-picker/date-picker';
import { InputTextComponent } from '../../../../shared/components/form-fields/input-text/input-text';
import { SelectComponent } from "../../../../shared/components/form-fields/select/select";

@Component({
  selector: 'app-portin-information-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextComponent,
    SelectComponent
  ],
  templateUrl: './portin-information-form.component.html',
  styleUrl: './portin-information-form.component.scss'
})
export class PortinInformationFormComponent {

  form = signal(
    new FormGroup({
      portinNumber: new FormControl('', Validators.required),
      donorOperator: new FormControl('', Validators.required),
      donorNumber: new FormControl('', Validators.required),
    })
  );

  donorOperator = signal([
    { label: 'Claro', value: 'claro' },
    { label: 'Tigo', value: 'tigo' },
  ]);

}
