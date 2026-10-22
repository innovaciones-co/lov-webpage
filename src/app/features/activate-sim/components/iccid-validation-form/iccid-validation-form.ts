import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ErrorCard } from '../../../../shared/components/error-card/error-card';
import { ActivateSimService } from '../../services/activate-sim.service';

export interface IccidValidationFormData {
  iccid: string;
  puk: string;
}

// Every LOV SIM serial (ICCID) starts with these 13 digits; the customer only types the last 6.
export const ICCID_PREFIX = '8957777200231';
const SUFFIX_LENGTH = 6;
const PUK_LENGTH = 8;

@Component({
  selector: 'app-iccid-validation-form',
  standalone: true,
  imports: [ReactiveFormsModule, ErrorCard],
  templateUrl: './iccid-validation-form.html',
  styleUrl: './iccid-validation-form.scss'
})
export class IccidValidationForm {

  private activateSimService = inject(ActivateSimService);

  readonly prefix = ICCID_PREFIX;
  readonly suffixLength = SUFFIX_LENGTH;
  readonly pukLength = PUK_LENGTH;

  hideButton = input(false);
  isLoading = signal(false);
  formSubmit = output<IccidValidationFormData>();

  validationError = signal<string>('');

  // The fixed prefix isn't part of the form, so it can't be deleted or edited.
  form = signal(
    new FormGroup({
      suffix: new FormControl('', [Validators.required, Validators.pattern(`^[0-9]{${SUFFIX_LENGTH}}$`)]),
      puk: new FormControl('', [Validators.required, Validators.pattern(`^[0-9]{${PUK_LENGTH}}$`)]),
    })
  );

  private readonly values = toSignal(this.form().valueChanges, { initialValue: this.form().value });
  readonly suffixCount = computed(() => (this.values().suffix ?? '').length);
  readonly pukCount = computed(() => (this.values().puk ?? '').length);

  constructor() {
    effect(() => {
      if (this.hideButton()) {
        this.form().disable();
      } else {
        this.form().enable();
      }
    });
  }

  // Digits only, cut to the field's length, as the customer types or pastes.
  onDigits(control: 'suffix' | 'puk', input: HTMLInputElement, max: number): void {
    let digits = input.value.replace(/[^0-9]/g, '');
    // Pasting the whole serial: keep what comes after the fixed prefix.
    if (control === 'suffix' && digits.startsWith(this.prefix) && digits.length > max) {
      digits = digits.slice(this.prefix.length);
    }
    digits = digits.slice(0, max);
    // Written back to the field too: a typed letter wouldn't change the model, so it would stay visible.
    input.value = digits;
    this.form().controls[control].setValue(digits);
  }

  showError(control: 'suffix' | 'puk'): boolean {
    const field = this.form().controls[control];
    return field.invalid && field.touched;
  }

  onSubmit(): void {
    this.form().markAllAsTouched();
    if (this.form().invalid) return;

    const formData: IccidValidationFormData = {
      iccid: this.prefix + this.form().value.suffix,
      puk: this.form().value.puk ?? '',
    };
    this.isLoading.set(true);
    this.validationError.set('');

    this.activateSimService.validateIccid(formData.iccid, formData.puk).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response?.payload?.subscriptions?.[0]?.state === 'INSTALLED') {
          this.activateSimService.setIccidValidationData(response);
          this.formSubmit.emit(formData);
        } else {
          this.validationError.set('Parece que esta SIM ya ha sido activada. Por favor verifica el serial y el código PUK de tu SIM. Si tienes dudas, contáctanos.');
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        this.validationError.set(error?.error?.message ||
          'Los datos ingresados no son válidos. Por favor verifica el serial y el código PUK de tu SIM.');
      }
    });
  }
}
