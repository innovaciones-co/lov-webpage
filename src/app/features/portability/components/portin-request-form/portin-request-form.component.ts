import { Component, signal } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CheckboxComponent } from '../../../../shared/components/form-fields/checkbox/checkbox';
import { DatePickerComponent } from '../../../../shared/components/form-fields/date-picker/date-picker';
import { InputTextComponent } from '../../../../shared/components/form-fields/input-text/input-text';

@Component({
  selector: 'app-portin-request-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextComponent,
    CheckboxComponent,
    DatePickerComponent
  ],
  templateUrl: './portin-request-form.component.html',
  styleUrl: './portin-request-form.component.scss'
})
export class PortinRequestFormComponent {

  form = signal(
    new FormGroup({
      nip: new FormControl(false, Validators.required),
      documentIssueDate: new FormControl('', Validators.required),
      documentID: new FormControl('', Validators.required),
      address: new FormControl('', Validators.required),
      portinDate: new FormControl('', Validators.required),
      terms: new FormControl(false, Validators.requiredTrue),
    })
  );

}
