import { CommonModule } from '@angular/common';
import { Component, computed, inject, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiResponse } from '../../../../core/models/api-response.model';
import { ErrorCard } from '../../../../shared/components/error-card/error-card';
import { getPortabilityErrorMessage } from '../../../../core/constants/portability-error-codes';
import { getPortabilityStateMessage } from '../../../../core/constants/portability-status-codes';
import { PortabilityStatusPayload } from '../../models/portability.models';
import { PortabilityService } from '../../services/portability.service';

export interface PortabilityStatusComponentData {
  number: string;
  documentId: string;
}

export interface StatusDisplay {
  status: string;
  message: string;
  tone: 'progress' | 'done' | 'failed' | 'none';
  icon: string;
  date?: string;
}

type Field = 'number' | 'documentId';

const DONE_STATES = ['PortSuccessful'];
const FAILED_STATES = ['PortFailed', 'PortInAbdRejected'];

@Component({
  selector: 'app-portability-status',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ErrorCard],
  templateUrl: './portability-status.html',
  styleUrl: './portability-status.scss'
})
export class PortabilityStatusComponent {
  portabilityService = inject(PortabilityService);

  formSubmit = output<PortabilityStatusComponentData>();
  isLoading = signal(false);
  validationError = signal<string>('');
  portabilityStatus = signal<PortabilityStatusPayload | null>(null);
  hasSearched = signal(false);

  form = signal(
    new FormGroup({
      number: new FormControl('', [Validators.required, Validators.pattern('^3[0-9]{9}$')]),
      documentId: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{5,15}$')]),
    })
  );

  private readonly values = toSignal(this.form().valueChanges, { initialValue: this.form().value });

  count(field: Field): number {
    return (this.values()[field] ?? '').length;
  }

  // Digits only, cut to the field's length, as the customer types or pastes (a pasted 57 is dropped).
  onDigits(field: Field, input: HTMLInputElement, max: number): void {
    let digits = input.value.replace(/[^0-9]/g, '');
    if (field === 'number' && digits.length > max && digits.startsWith('57')) digits = digits.slice(2);
    digits = digits.slice(0, max);
    input.value = digits;
    this.form().controls[field].setValue(digits);
  }

  showError(field: Field): boolean {
    const control = this.form().controls[field];
    return control.invalid && control.touched;
  }

  statusDisplay = computed<StatusDisplay | null>(() => {
    const status = this.portabilityStatus();

    if (!status) return null;

    if (!status.state) {
      return {
        status: 'Sin portabilidad en proceso',
        message: 'No hay ninguna portabilidad en proceso para ese número.',
        tone: 'none',
        icon: 'info'
      };
    }

    let errorMessage = '';
    if (status.errorMessage) {
      try {
        const parsedError = JSON.parse(status.errorMessage);
        const errorCode = Array.isArray(parsedError) ? parsedError[0] : parsedError;
        errorMessage = getPortabilityErrorMessage(errorCode) || '';
      } catch (e) {
        // Si no es JSON válido, usar el string tal cual
        errorMessage = getPortabilityErrorMessage(status.errorMessage) || '';
      }
    }

    const done = DONE_STATES.includes(status.state);
    const failed = FAILED_STATES.includes(status.state);
    return {
      status: getPortabilityStateMessage(status.state) || 'Estado desconocido',
      message: errorMessage,
      tone: done ? 'done' : failed ? 'failed' : 'progress',
      icon: done ? 'check_circle' : failed ? 'error' : 'sync',
      date: status.portingDate
    };
  });

  onSubmit(): void {
    this.form().markAllAsTouched();
    if (this.form().invalid) return;

    const { number, documentId } = this.form().value as PortabilityStatusComponentData;
    this.isLoading.set(true);
    this.validationError.set('');
    this.portabilityStatus.set(null);
    this.hasSearched.set(false);

    this.portabilityService.checkPortabilityStatus(number, documentId).subscribe({
      next: (response: ApiResponse<PortabilityStatusPayload>) => {
        this.isLoading.set(false);
        this.hasSearched.set(true);
        this.portabilityStatus.set(response?.payload ?? {});
        this.formSubmit.emit({ number, documentId });
      },
      error: (error: { status?: number; error?: { message?: string } }) => {
        console.error('Error checking portability status:', error);
        this.isLoading.set(false);
        this.hasSearched.set(true);
        this.validationError.set(error?.status === 404
          ? 'No encontramos una portabilidad con ese número y cédula. Revisa los datos e intenta de nuevo.'
          : error?.error?.message || 'No pudimos consultar el estado en este momento. Intenta de nuevo en unos minutos.');
      }
    });
  }

}
