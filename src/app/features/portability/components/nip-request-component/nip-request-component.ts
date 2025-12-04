import { Component, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { InputTextComponent } from '../../../../shared/components/form-fields/input-text/input-text';
import { SelectComponent } from '../../../../shared/components/form-fields/select/select';
import { DatePickerComponent } from "../../../../shared/components/form-fields/date-picker/date-picker";

@Component({
  selector: 'app-nip-request-component',
  imports: [ReactiveFormsModule, InputTextComponent, SelectComponent, DatePickerComponent],
  templateUrl: './nip-request-component.html',
  styleUrl: './nip-request-component.scss'
})
export class NipRequestComponent {

  form = signal(
    new FormGroup({
      nip: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{5}$')]),
      donorPlan: new FormControl('', Validators.required),
      portinDate: new FormControl('', Validators.required),
    })
  );

  planOptions = signal([
    { label: 'Pospago', value: 'pospay' },
    { label: 'Prepago', value: 'pospaid' },
  ]);

}
