import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextComponent } from '../../../../shared/components/form-fields/input-text/input-text';
import { SelectComponent } from '../../../../shared/components/form-fields/select/select';
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
    CheckboxComponent,
    DatePickerComponent,
  ]
})
export class NewPortabilityComponent {
  form_1 = signal(
    new FormGroup({
      donorNumber: new FormControl('', Validators.required),
      donorPlan: new FormControl('', Validators.required),
      lovNumber: new FormControl('', Validators.required),
      iccidDigits: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{5}$')]),
    })
  );

  form_2 = signal(
    new FormGroup({
      nip: new FormControl(false, Validators.required),
    })
  );

  form_3 = signal(
    new FormGroup({
      documentIssueDate: new FormControl('', Validators.required),
      documentID: new FormControl('', Validators.required),
      address: new FormControl('', Validators.required),
      portinDate: new FormControl('', Validators.required),
      terms: new FormControl(false, Validators.requiredTrue),
    })
  );

  planOptions = signal([
    { label: 'Pospago', value: 'pospay' },
    { label: 'Prepago', value: 'pospaid' },
  ]);

}
