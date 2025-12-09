import { Component, signal, output } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { InputTextComponent } from '../../../../shared/components/form-fields/input-text/input-text';
import { SelectComponent } from "../../../../shared/components/form-fields/select/select";

export interface PortinInformationData {
  donorNumber: string;
  donorOperator: string;
  donorPlan: string;
}

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
      donorNumber: new FormControl('', Validators.required),
      donorOperator: new FormControl('', Validators.required),
      donorPlan: new FormControl('', Validators.required),
    })
  );

  donorOperator = signal([
    { label: 'Claro', value: 'claro' },
    { label: 'Tigo', value: 'tigo' },
  ]);

  planOptions = signal([
    { label: 'Pospago', value: 'pospay' },
    { label: 'Prepago', value: 'pospaid' },
  ]);

  formSubmit = output<PortinInformationData>();

  onSubmit(): void {
    if (this.form().valid) {
      this.formSubmit.emit(this.form().value as PortinInformationData);
    }
  }

}
