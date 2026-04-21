import { DatePipe, CommonModule } from '@angular/common';
import { Component, computed, inject, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiResponse } from '../../../../core/models/api-response.model';
import { ErrorCard } from '../../../../shared/components/error-card/error-card';
import { InputTextComponent } from '../../../../shared/components/form-fields/input-text/input-text';
import { getPortabilityErrorMessage } from '../../../../core/constants/portability-error-codes';
import { getPortabilityStateMessage } from '../../../../core/constants/portability-status-codes';
import { PortabilityStatusPayload } from '../../models/portability.models';
import { PortabilityService } from '../../services/portability.service';
import { MsisdnPipe } from "../../../../core/pipes/msisdn.pipe";

export interface PortabilityStatusComponentData {
  lovNumber: string;
}

export interface StatusDisplay {
  status: string;
  message: string;
  cssClass: string;
}

@Component({
  selector: 'app-portability-status',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextComponent, ErrorCard],
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

  errorMessages: Record<string, Record<string, string>> = {
    lovNumber: {
      pattern: 'El número debe tener 10 dígitos numéricos'
    }
  };

  form = signal(
    new FormGroup({
      lovNumber: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10}$')]),
    })
  );

  getFieldErrorMessage(fieldName: string): string {
    const control = this.form().get(fieldName);
    if (!control?.errors || !control.touched) return '';

    const firstError = Object.keys(control.errors)[0];

    if (firstError === 'required') return 'Este campo es obligatorio';

    const fieldErrors = this.errorMessages[fieldName];
    return fieldErrors?.[firstError] || 'Error de validación';
  }

  statusDisplay = computed<StatusDisplay | null>(() => {
    const status = this.portabilityStatus();

    if (!status) return null;

    // Si existe state, mostrar ese estado
    if (status.state) {
      const stateMessage = getPortabilityStateMessage(status.state) || 'DESCONOCIDO';
      const errorMessage = status.errorMessage ? getPortabilityErrorMessage(status.errorMessage) : '';

      return {
        status: stateMessage,
        message: errorMessage || '',
        cssClass: ''
      };
    }

    // Si no existe state, mostrar estado NO INICIADO
    if (!status.state) {
      const lovNumber = this.form().get('lovNumber')?.value || '';
      return {
        status: 'NO INICIADO',
        message: `No hay ninguna portabilidad en proceso para el número <em><b>${lovNumber}</b></em>.`,
        cssClass: ''
      };
    }

    // Fallback para estado desconocido
    return {
      status: 'DESCONOCIDO',
      message: 'No se pudo determinar el estado de la portabilidad.',
      cssClass: ''
    };
  });

  onSubmit(): void {
    if (this.form().valid) {
      const { lovNumber } = this.form().value as PortabilityStatusComponentData;
      this.isLoading.set(true);
      this.validationError.set('');
      this.portabilityStatus.set(null);
      this.hasSearched.set(false);

      this.portabilityService.validatePortabilityStatus(lovNumber).subscribe({
        next: (response: ApiResponse<PortabilityStatusPayload>) => {
          console.debug('Portability status response:', response.payload);
          this.isLoading.set(false);
          this.hasSearched.set(true);
          this.portabilityStatus.set(response.payload ?? null);
          this.formSubmit.emit(this.form().value as PortabilityStatusComponentData);
        },
        error: (error: { error?: { message?: string } }) => {
          console.error('Error validating portability status:', error);
          this.isLoading.set(false);
          this.hasSearched.set(true);
          const errorMessage = error?.error?.message || 'Error validando el estado de portabilidad. Por favor verifica el número LOV.';
          this.validationError.set(errorMessage);
        }
      });
    }
  }

}
