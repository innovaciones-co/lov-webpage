import { Component, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { InputTextComponent } from '../../../../shared/components/form-fields/input-text/input-text';
import { SelectComponent } from '../../../../shared/components/form-fields/select/select';

@Component({
  selector: 'app-nip-request-component',
  imports: [ReactiveFormsModule, InputTextComponent, SelectComponent],
  templateUrl: './nip-request-component.html',
  styleUrl: './nip-request-component.scss'
})
export class NipRequestComponent {

  form = signal(
    new FormGroup({
      donorNumber: new FormControl('', Validators.required),
      donorPlan: new FormControl('', Validators.required),
      lovNumber: new FormControl('', Validators.required),
      iccidDigits: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{5}$')]),
    })
  );

  planOptions = signal([
    { label: 'Pospago', value: 'pospay' },
    { label: 'Prepago', value: 'pospaid' },
  ]);

}
