import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, input, signal, ElementRef } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextComponent } from "../../../shared/components/form-fields/input-text/input-text";
import { SelectComponent } from "../../../shared/components/form-fields/select/select";
import { CheckboxComponent } from "../../../shared/components/form-fields/checkbox/checkbox";
import { SwitchComponent } from "../../../shared/components/form-fields/switch/switch";
import { ErrorCard } from "../../../shared/components/error-card/error-card";
import { Loading } from "../../../shared/components/loading/loading";
import { Modal } from "../../../shared/components/modal/modal";
import { CustomerSubscription } from '../../../core/models/customer.model';
import { DashboardService } from '../services/dashboard.service';
import { CreatePaymentMethod } from "../../payment-methods/create-payment-method/create-payment-method";

@Component({
  selector: 'app-recharge-scheduler',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextComponent, SelectComponent, CheckboxComponent, SwitchComponent, ErrorCard, Loading, Modal, CreatePaymentMethod],
  templateUrl: './recharge-scheduler.html',
  styleUrl: './recharge-scheduler.scss'
})
export class RechargeScheduler {
  private dashboardService = inject(DashboardService);
  private elementRef = inject(ElementRef);

  subscription = input<CustomerSubscription | undefined>();

  creditCards = signal<any[]>([]);
  loadingCreditCards = signal<boolean>(true);
  submitError = signal<string>('');
  isSubmitting = signal<boolean>(false);
  isDisabling = signal<boolean>(false);
  disableError = signal<string>('');
  isModalOpen = signal(false);
  isDisableConfirmationModalOpen = signal(false);
  savedRecharge = signal<any>(null);
  loadingSavedRecharge = signal<boolean>(false);
  refreshRechargeData = signal(0);

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
      .filter(card => card.truncatedNumber)
      .map(card => ({
        label: `${card.issuer} - ${card.truncatedNumber}`,
        value: card.id
      }));
  });

  frequency = signal([
    { label: 'Semanal', value: 'WEEKLY' },
    { label: 'Quincenal', value: 'BIWEEKLY' },
    { label: 'Mensual', value: 'MONTHLY' },
  ]);

  subscriptionId = computed(() => {
    const sub = this.subscription();
    return sub?.id ?? null;
  });

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
      console.debug('Fetching credit cards');
      this.loadingCreditCards.set(true);
      this.dashboardService.getCreditCards().subscribe({
        next: (response) => {
          // console.debug('Credit cards fetched:', response);
          const cards = Array.isArray(response) ? response : (response.payload || []);
          this.creditCards.set(cards);
          this.dashboardService.setCreditCardsData(response);
          this.loadingCreditCards.set(false);
        },
        error: (error) => {
          console.error('Error fetching credit cards:', error);
          this.loadingCreditCards.set(false);
        }
      });
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

    // Effect to fetch saved recharge
    effect(() => {
      this.refreshRechargeData(); // Dependency para disparar el effect
      const subscriptionId = this.subscriptionId();
      if (subscriptionId) {
        console.debug('Fetching saved recharge for subscription ID:', subscriptionId);
        this.loadingSavedRecharge.set(true);
        this.dashboardService.getSavedRecharge(subscriptionId.toString()).subscribe({
          next: (response) => {
            const payloadData = response.payload || response;
            console.log('Saved recharge data to set:', payloadData);
            this.savedRecharge.set(payloadData);
            // Set switch state based on whether autoTopup exists
            const hasAutoTopup = !!payloadData?.autoTopup;
            this.form().get('autoRecharge')?.setValue(hasAutoTopup, { emitEvent: false });
            this.dashboardService.setRechargeData(response);
            this.loadingSavedRecharge.set(false);
          },
          error: (error) => {
            console.error('Error fetching saved recharge:', error);
            this.loadingSavedRecharge.set(false);
          }
        });
      }
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

    const rechargeData: any = {
      paymentMethodId: formValue.paymentMethod,
      amount: formValue.amount
    };

    // Mapear frequency según el valor seleccionado
    switch (formValue.frequency) {
      case 'MONTHLY':
        rechargeData.dayOfMonth = formValue.dayOfMonth;
        break;
      case 'BIWEEKLY':
        rechargeData.frequency = 15;
        break;
      case 'WEEKLY':
        rechargeData.frequency = 8;
        break;
      default:
        rechargeData.frequency = '';
    }

    this.dashboardService.submitRecharge(this.subscriptionId()?.toString() || '', rechargeData).subscribe({
      next: (response) => {
        console.debug('Recharge submitted successfully:', response);
        this.isSubmitting.set(false);
        this.form().reset();
        // Recargar solo la información guardada de recarga
        this.refreshRechargeData.update(val => val + 1);
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

  onAutoRechargeChange(newValue: boolean): void {
    if (newValue) {
      // Rechazar intento de activación manual
      this.form().get('autoRecharge')?.setValue(false, { emitEvent: false });
      return;
    }

    // Abrir modal de confirmación para desactivar
    this.isDisableConfirmationModalOpen.set(true);
    this.form().get('autoRecharge')?.setValue(true, { emitEvent: false });
  }

  onConfirmDisable(): void {
    this.isDisabling.set(true);
    this.disableError.set('');
    this.dashboardService.deleteScheduledRecharge(this.subscriptionId()?.toString() || '').subscribe({
      next: (response) => {
        this.isDisableConfirmationModalOpen.set(false);
        this.form().get('autoRecharge')?.setValue(false, { emitEvent: false });
        this.isDisabling.set(false);
        this.disableError.set('');
        // Recargar la información de recarga
        this.refreshRechargeData.update(val => val + 1);
      },
      error: (error) => {
        console.error('Error deleting scheduled recharge:', error);
        this.isDisabling.set(false);
        const errorMessage = error?.error?.message || 'Error al desactivar la recarga automática. Por favor, intenta de nuevo más tarde.';
        this.disableError.set(errorMessage);
      }
    });
  }

  onCancelDisable(): void {
    this.isDisableConfirmationModalOpen.set(false);
    this.form().get('autoRecharge')?.setValue(true, { emitEvent: false });
    this.disableError.set('');
  }
}
