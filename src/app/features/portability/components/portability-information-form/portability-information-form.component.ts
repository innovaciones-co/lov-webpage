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

// Every LOV number starts with 333: shown fixed, so the field reads as the LOV line (not the
// one being brought) and the customer types only the last 7 digits.
const LOV_NUMBER_PREFIX = '333';
const LOV_SUFFIX_LENGTH = 7;
const ICCID_DIGITS_LENGTH = 5;

type Field = 'lovSuffix' | 'iccidDigits';

@Component({
  selector: 'app-portability-information-form',
  standalone: true,
  imports: [ReactiveFormsModule, Modal],
  templateUrl: './portability-information-form.component.html',
  styleUrl: './portability-information-form.component.scss'
})
export class PortabilityInformation {
  private portabilityService = inject(PortabilityService);

  readonly lovPrefix = LOV_NUMBER_PREFIX;
  readonly lovSuffixLength = LOV_SUFFIX_LENGTH;
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
      lovSuffix: new FormControl('', [Validators.required, Validators.pattern(`^[0-9]{${LOV_SUFFIX_LENGTH}}$`)]),
      iccidDigits: new FormControl('', [Validators.required, Validators.pattern(`^[0-9]{${ICCID_DIGITS_LENGTH}}$`)]),
    })
  );

  private readonly values = toSignal(this.form().valueChanges, { initialValue: this.form().value });
  readonly lovSuffixCount = computed(() => (this.values().lovSuffix ?? '').length);
  readonly iccidDigitsCount = computed(() => (this.values().iccidDigits ?? '').length);

  constructor() {
    effect(() => {
      const initial = this.initial();
      if (initial) {
        this.form().patchValue({ lovSuffix: initial.lovNumber?.slice(LOV_NUMBER_PREFIX.length), iccidDigits: initial.iccidDigits });
      }
    });
  }

  // Digits only, cut to the field's length, as the customer types or pastes.
  onDigits(control: Field, input: HTMLInputElement, max: number): void {
    let digits = input.value.replace(/[^0-9]/g, '');
    if (control === 'lovSuffix' && digits.length > max) {
      // A pasted whole number (with or without 57): keep what comes after 333.
      if (digits.startsWith('57')) digits = digits.slice(2);
      if (digits.startsWith(LOV_NUMBER_PREFIX)) digits = digits.slice(LOV_NUMBER_PREFIX.length);
    }
    // A pasted whole serial: keep its last digits, the ones asked for.
    if (control === 'iccidDigits' && digits.length > max) digits = digits.slice(-max);
    digits = digits.slice(0, max);
    // Written back to the field too: a typed letter wouldn't change the model, so it would stay visible.
    input.value = digits;
    this.form().controls[control].setValue(digits);
  }

  showError(control: Field): boolean {
    const field = this.form().controls[control];
    return field.invalid && field.touched;
  }

  async onSubmit(): Promise<void> {
    this.form().markAllAsTouched();
    if (this.form().invalid) return;

    this.isLoading.set(true);
    const lovNumber = LOV_NUMBER_PREFIX + (this.form().value.lovSuffix ?? '');
    const iccidDigits = this.form().value.iccidDigits ?? '';
    const validation = await this.portabilityService.validateSimCard(lovNumber, iccidDigits);
    this.isLoading.set(false);

    if (!validation.isValid) {
      this.simInvalidModalOpen.set(true);
      return;
    }

    const formData: PortabilityInformationData = { lovNumber, iccidDigits, payload: validation.payload };

    this.formSubmit.emit(formData);
  }

  onCancelModal(): void {
    this.simInvalidModalOpen.set(false);
  }

  onContinueModal(): void {
    this.simInvalidModalOpen.set(false);
  }

}
