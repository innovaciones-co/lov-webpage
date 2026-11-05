import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Modal } from "../../../../shared/components/modal/modal";
import { ICCID_PREFIX } from '../../../activate-sim/components/iccid-validation-form/iccid-validation-form';
import { PortabilityService } from '../../services/portability.service';

export interface PortabilityInformationData {
  lovNumber: string;
  iccidDigits: string;
  payload?: any;
}

const NUMBER_LENGTH = 10;
const ICCID_DIGITS_LENGTH = 5;

@Component({
  selector: 'app-portability-information-form',
  standalone: true,
  imports: [ReactiveFormsModule, Modal],
  templateUrl: './portability-information-form.component.html',
  styleUrl: './portability-information-form.component.scss'
})
export class PortabilityInformation {
  private portabilityService = inject(PortabilityService);

  readonly numberLength = NUMBER_LENGTH;
  readonly iccidDigitsLength = ICCID_DIGITS_LENGTH;
  // The serial's start, shown on the card guide; the barcode's last digits are the serial's.
  readonly serialStart = ICCID_PREFIX + '#';

  // What the customer already entered, when they come back to this step.
  initial = input<PortabilityInformationData | null>(null);
  formSubmit = output<PortabilityInformationData>();
  simInvalidModalOpen = signal(false);
  isLoading = signal(false);

  form = signal(
    new FormGroup({
      // A Colombian mobile number: 10 digits starting with 3.
      lovNumber: new FormControl('', [Validators.required, Validators.pattern(`^3[0-9]{${NUMBER_LENGTH - 1}}$`)]),
      iccidDigits: new FormControl('', [Validators.required, Validators.pattern(`^[0-9]{${ICCID_DIGITS_LENGTH}}$`)]),
    })
  );

  private readonly values = toSignal(this.form().valueChanges, { initialValue: this.form().value });
  readonly numberCount = computed(() => (this.values().lovNumber ?? '').length);
  readonly iccidDigitsCount = computed(() => (this.values().iccidDigits ?? '').length);

  constructor() {
    effect(() => {
      const initial = this.initial();
      if (initial) this.form().patchValue({ lovNumber: initial.lovNumber, iccidDigits: initial.iccidDigits });
    });
  }

  // Digits only, cut to the field's length, as the customer types or pastes.
  onDigits(control: 'lovNumber' | 'iccidDigits', input: HTMLInputElement, max: number): void {
    let digits = input.value.replace(/[^0-9]/g, '');
    // A pasted number with the country code: keep the local 10 digits.
    if (control === 'lovNumber' && digits.length > max && digits.startsWith('57')) digits = digits.slice(2);
    // A pasted whole serial: keep its last digits, the ones asked for.
    if (control === 'iccidDigits' && digits.length > max) digits = digits.slice(-max);
    digits = digits.slice(0, max);
    // Written back to the field too: a typed letter wouldn't change the model, so it would stay visible.
    input.value = digits;
    this.form().controls[control].setValue(digits);
  }

  showError(control: 'lovNumber' | 'iccidDigits'): boolean {
    const field = this.form().controls[control];
    return field.invalid && field.touched;
  }

  async onSubmit(): Promise<void> {
    this.form().markAllAsTouched();
    if (this.form().invalid) return;

    this.isLoading.set(true);
    const lovNumber = this.form().value.lovNumber ?? '';
    const iccidDigits = this.form().value.iccidDigits ?? '';
    const validation = await this.portabilityService.validateSimCard(lovNumber, iccidDigits);
    this.isLoading.set(false);

    if (!validation.isValid) {
      this.simInvalidModalOpen.set(true);
      return;
    }

    const formData: PortabilityInformationData = {
      ...this.form().value as PortabilityInformationData,
      payload: validation.payload
    };

    this.formSubmit.emit(formData);
  }

  onCancelModal(): void {
    this.simInvalidModalOpen.set(false);
  }

  onContinueModal(): void {
    this.simInvalidModalOpen.set(false);
  }

}
