import { Component, signal, output, inject, input, effect, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, AbstractControl, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { PortabilityService } from '../../services/portability.service';
import { CheckboxComponent } from '../../../../shared/components/form-fields/checkbox/checkbox';
import { DatePickerComponent } from '../../../../shared/components/form-fields/date-picker/date-picker';
import { ErrorCard } from "../../../../shared/components/error-card/error-card";

export interface CustomerInformationData {
  nip: string;
  portinDate: string;
  fullName: string;
  documentType: string;
  documentID: string;
  documentIssueDate: string;
  address: string;
}

type DigitsField = 'nip' | 'documentID';

/** Tomorrow, as the form's YYYY-MM-DD value and a short label ("mañana, vie 6 nov"). */
function soonestPortinDate(): { iso: string; label: string } {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  const iso = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
  const day = date.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' })
    .replace(/[.,]/g, '').replace(' de ', ' ');
  return { iso, label: `mañana, ${day}` };
}

@Component({
  selector: 'app-customer-information-form',
  imports: [
    ReactiveFormsModule,
    DatePickerComponent,
    CheckboxComponent,
    ErrorCard
  ],
  templateUrl: './customer-information-form.html',
  styleUrl: './customer-information-form.scss'
})
export class CustomerInformationFormComponent {
  private router = inject(Router);
  private portabilityService = inject(PortabilityService);

  donorData = input.required<any>();
  portabilityData = input.required<any>();
  // What the customer already typed or corrected (saved draft): wins over CYAN's data.
  initial = input<Partial<CustomerInformationData> | null>(null);
  // Every change, so the page keeps it if the customer goes back or reloads.
  draftChange = output<Partial<CustomerInformationData>>();

  isLoading = signal(false);
  submitError = signal<string>('');

  readonly donorNumber = computed(() => {
    const number: string = this.donorData()?.donorNumber ?? '';
    return number.length === 10 ? `${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(6)}` : number;
  });

  // Error messages map (only specific validations, required is automatic)
  errorMessages: Record<string, Record<string, string>> = {
    nip: {
      pattern: 'El NIP debe tener el formato correcto'
    },
    portinDate: {
      futureDate: 'Elige un día a partir de mañana'
    },
    documentIssueDate: {
      pastDate: 'La fecha debe ser anterior a hoy'
    },
    documentID: {
      pattern: 'El documento debe tener el formato correcto'
    },
    terms: {
      required: 'Debes aceptar para continuar'
    }
  };

  // Future date validator
  private futureDateValidator(): ValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value) return null;

      // The date-picker component now handles the date format correctly
      const dateValue = control.value;
      const [year, month, day] = dateValue.split('-').map(Number);

      // Create dates in local timezone
      const selectedDate = new Date(year, month - 1, day);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return selectedDate > today ? null : { futureDate: true };
    };
  }

  // Past date validator
  private pastDateValidator(): ValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value) return null;

      // The date-picker component now handles the date format correctly
      const dateValue = control.value;
      const [year, month, day] = dateValue.split('-').map(Number);

      // Create dates in local timezone
      const selectedDate = new Date(year, month - 1, day);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return selectedDate < today ? null : { pastDate: true };
    };
  }

  form = signal(
    new FormGroup({
      nip: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{5}$')]),
      portinDate: new FormControl('', [Validators.required, this.futureDateValidator()]),
      fullName: new FormControl('', Validators.required),
      documentType: new FormControl('', Validators.required),
      documentID: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{7,15}$')]),
      documentIssueDate: new FormControl('', [Validators.required, this.pastDateValidator()]),
      address: new FormControl('', Validators.required),
      terms: new FormControl(false, Validators.requiredTrue),
    })
  );

  private readonly values = toSignal(this.form().valueChanges, { initialValue: this.form().value });

  documentType = signal([
    { label: 'Cédula', value: 'ID' },
    { label: 'Cédula de extranjería', value: 'foreignID' },
  ]);

  formSubmit = output<CustomerInformationData>();

  private prefilled = false;

  // The earliest porting date the form accepts: tomorrow.
  readonly soonest = soonestPortinDate();
  portinChoice = signal<'soonest' | 'other'>('soonest');

  constructor() {
    // Fill once: with what the customer already typed, else with their data in CYAN. Always editable.
    effect(() => {
      const draft = this.initial();
      const customer = this.portabilityData()?.payload;
      if (this.prefilled) return;
      this.prefilled = true;

      if (draft) {
        this.form().patchValue(draft);
      } else if (customer) {
        const { document, address, givenName, familyName } = customer;
        this.form().patchValue({
          documentID: document?.id ?? '',
          documentType: document?.type ?? '',
          address: address?.line1 ?? '',
          fullName: [givenName, familyName].filter(Boolean).join(' '),
        });
      }

      // A date the customer picked earlier stays; none, or one already past, becomes the soonest.
      const date = this.form().controls.portinDate;
      if (date.value && date.valid && date.value !== this.soonest.iso) {
        this.portinChoice.set('other');
      } else {
        this.chooseSoonest();
      }
    });

    this.form().valueChanges.subscribe(() => {
      const { terms, ...data } = this.form().getRawValue();
      this.draftChange.emit(data as Partial<CustomerInformationData>);
    });
  }

  chooseSoonest(): void {
    this.portinChoice.set('soonest');
    this.form().controls.portinDate.setValue(this.soonest.iso);
  }

  count(field: DigitsField): number {
    return (this.values()[field] ?? '').length;
  }

  // Digits only, cut to the field's length, as the customer types or pastes.
  onDigits(field: DigitsField, input: HTMLInputElement, max: number): void {
    const digits = input.value.replace(/[^0-9]/g, '').slice(0, max);
    input.value = digits;
    this.form().controls[field].setValue(digits);
  }

  showError(field: keyof CustomerInformationData): boolean {
    const control = this.form().controls[field];
    return control.invalid && control.touched;
  }

  // Get error message for a specific field
  getFieldErrorMessage(fieldName: string): string {
    const control = this.form().get(fieldName);
    if (!control?.errors || !control.touched) return '';

    const firstError = Object.keys(control.errors)[0];

    // Use field-specific message when there is one
    const specific = this.errorMessages[fieldName]?.[firstError];
    if (specific) return specific;
    if (firstError === 'required') return 'Este campo es obligatorio';
    return 'Error de validación';
  }

  async onSubmit(): Promise<void> {
    this.form().markAllAsTouched();
    if (!this.form().valid) return;

    this.isLoading.set(true);
    this.submitError.set('');
    const data = this.form().value as CustomerInformationData;

    try {
      await this.portabilityService.submitPortability(data, this.donorData(), this.portabilityData());
      // So they can check it later with the number they're bringing and their document.
      this.portabilityService.recordPortability(data, this.donorData(), this.portabilityData());

      this.formSubmit.emit(data);
      await this.router.navigate(['/portabilidad/exitoso']);
    } catch (error: any) {
      const errorMessage = error?.error?.message ||
        'Error al procesar la solicitud de portabilidad. Por favor, inténtelo de nuevo más tarde o contacte con soporte para más información.';
      this.submitError.set(errorMessage);
      console.error('Error submitting portability request:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

}
