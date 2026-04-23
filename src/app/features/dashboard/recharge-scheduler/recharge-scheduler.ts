import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextComponent } from "../../../shared/components/form-fields/input-text/input-text";
import { SelectComponent } from "../../../shared/components/form-fields/select/select";
import { CheckboxComponent } from "../../../shared/components/form-fields/checkbox/checkbox";
import { SwitchComponent } from "../../../shared/components/form-fields/switch/switch";
import { ErrorCard } from "../../../shared/components/error-card/error-card";
import { Loading } from "../../../shared/components/loading/loading";
import { Modal } from "../../../shared/components/modal/modal";
import { DashboardService } from '../services/dashboard.service';

@Component({
  selector: 'app-recharge-scheduler',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextComponent, SelectComponent, CheckboxComponent, SwitchComponent, ErrorCard, Loading, Modal],
  templateUrl: './recharge-scheduler.html',
  styleUrl: './recharge-scheduler.scss'
})
export class RechargeScheduler {
  private dashboardService = inject(DashboardService);

  userId = input<number>();

  creditCards = signal<any[]>([]);
  loadingCreditCards = signal<boolean>(true);
  submitError = signal<string>('');
  isSubmitting = signal<boolean>(false);
  isModalOpen = signal(false);

  errorMessages: Record<string, Record<string, string>> = {
    amount: {
      pattern: 'El monto debe ser entre $3.000 y $150.000',
      min: 'El monto mínimo es $3.000',
      max: 'El monto máximo es $150.000'
    },
    paymentMethod: {
      pattern: 'El método de pago es obligatorio'
    },
    frequency: {
      pattern: 'La frecuencia de la recarga es obligatoria'
    },
    dayOfMonth: {
      pattern: 'El día del mes debe ser un número entre 1 y 31',
      min: 'El día del mes debe ser mayor o igual a 1',
      max: 'El día del mes debe ser menor o igual a 31'
    }
  };

  paymentMethod = computed(() => {
    return this.creditCards()
      .filter(card => card.paymentMethodDetails?.truncatedNumber)
      .map(card => ({
        label: `${card.paymentMethodDetails.issuer} - ${card.paymentMethodDetails.truncatedNumber}`,
        value: card.oppId
      }));
  });

  frequency = signal([
    { label: 'Semanal', value: 'WEEKLY' },
    { label: 'Quincenal', value: 'BIWEEKLY' },
    { label: 'Mensual', value: 'MONTHLY' },
  ]);

  form = signal(
    new FormGroup({
      autoRecharge: new FormControl(false),
      amount: new FormControl('', [Validators.required, Validators.max(150000), Validators.min(3000), Validators.pattern('^[0-9]{4,6}$')]),
      paymentMethod: new FormControl('', Validators.required),
      frequency: new FormControl('', Validators.required),
      dayOfMonth: new FormControl('', [Validators.min(1), Validators.max(31), Validators.pattern('^[0-9]{1,2}$')]),
      terms: new FormControl(false, Validators.requiredTrue),
    })
  );

  constructor() {
    effect(() => {
      const userId = this.userId();
      if (userId) {
        console.debug('Fetching credit cards for user ID:', userId);
        this.loadingCreditCards.set(true);
        this.dashboardService.getCreditCards(userId.toString()).subscribe({
          next: (response) => {
            console.debug('Credit cards fetched:', response);
            this.creditCards.set(response.payload || []);
            this.dashboardService.setCreditCardsData(response);
            this.loadingCreditCards.set(false);
          },
          error: (error) => {
            console.error('Error fetching credit cards:', error);
            this.loadingCreditCards.set(false);
          }
        });
      }
    });

    effect(() => {
      this.form().get('frequency')?.valueChanges.subscribe(frequency => {
        const dayOfMonthControl = this.form().get('dayOfMonth');
        if (frequency === 'MONTHLY') {
          dayOfMonthControl?.setValidators([Validators.required, Validators.min(1), Validators.max(31), Validators.pattern('^[0-9]{1,2}$')]);
        } else {
          dayOfMonthControl?.setValidators([Validators.min(1), Validators.max(31), Validators.pattern('^[0-9]{1,2}$')]);
        }
        dayOfMonthControl?.updateValueAndValidity();
      });
    });
  }

  getFieldErrorMessage(fieldName: string): string {
    const control = this.form().get(fieldName);
    if (!control?.errors || !control.touched) return '';

    const firstError = Object.keys(control.errors)[0];

    if (firstError === 'required') return 'Este campo es obligatorio';

    return this.errorMessages[fieldName]?.[firstError] || 'Error de validación';
  }

  onSubmit(): void {
    if (!this.form().valid) return;
    
    this.isSubmitting.set(true);
    this.submitError.set('');

    const formValue = this.form().value;
    const rechargeData = {
      amount: formValue.amount,
      paymentMethodId: formValue.paymentMethod,
      frequency: formValue.frequency,
      dayOfMonth: formValue.dayOfMonth || null,
      autoRecharge: formValue.autoRecharge
    };

    this.dashboardService.submitRecharge(rechargeData).subscribe({
      next: (response) => {
        console.debug('Recharge submitted successfully:', response);
        this.isSubmitting.set(false);
        this.form().reset();
      },
      error: (error) => {
        console.error('Error submitting recharge:', error);
        this.isSubmitting.set(false);
        const errorMessage = error?.error?.message || 'Error al procesar la recarga. Por favor, intenta de nuevo más tarde.';
        this.submitError.set(errorMessage);
      }
    });
  }

  onCancel(): void {
    this.form().reset();
    this.submitError.set('');
  }

  onEditClick(): void {
    this.isModalOpen.set(true);
  }

  onContinueModal(): void {
    // TODO: Implement add card logic
    this.isModalOpen.set(false);
  }

  onCancelModal(): void {
    this.isModalOpen.set(false);
  }
}
