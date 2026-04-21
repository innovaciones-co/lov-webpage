import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { CustomerSubscription } from '../../core/models/customer.model';
import { CapitalizePipe } from "../../core/pipes/capitalize.pipe";
import { MsisdnPipe } from "../../core/pipes/msisdn.pipe";
import { SubscriptionFacadeService } from '../../core/services/subscription-facade.service';
import { Loading } from "../../shared/components/loading/loading";
import { User } from '../authentication/models/auth.models';
import { AuthService } from '../authentication/services/auth.service';
import { InputTextComponent } from "../../shared/components/form-fields/input-text/input-text";
import { SelectComponent } from "../../shared/components/form-fields/select/select";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CheckboxComponent } from "../../shared/components/form-fields/checkbox/checkbox";
import { SwitchComponent } from "../../shared/components/form-fields/switch/switch";
import { RadioComponent } from "../../shared/components/form-fields/radio/radio";
import { ErrorCard } from "../../shared/components/error-card/error-card";
import { min } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, ReactiveFormsModule, CapitalizePipe, Loading, MsisdnPipe, InputTextComponent, SelectComponent, CheckboxComponent, SwitchComponent, ErrorCard],
  templateUrl: './dashboard.html',
  styleUrls: [`./dashboard.scss`]
})
export class Dashboard implements OnInit {
  private authService = inject(AuthService);
  private subscriptionFacade = inject(SubscriptionFacadeService);
  user: User | null = null;
  activeSubscriptions = signal<CustomerSubscription[]>([]);
  loading = signal(true);
  billingInfo: any = null;
  accounts = signal<any[]>([]);

  submitError = signal<string>('');

  // Error messages map (only specific validations, required is automatic)
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

  paymentMethod = signal([
    { label: 'Tarjeta A', value: 'ID_A' },
    { label: 'Tarjeta B', value: 'ID_B' },
    { label: 'Tarjeta C', value: 'ID_C' },
  ]);

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

  ngOnInit() {
    // Subscribe to frequency changes to make dayOfMonth conditionally required
    this.form().get('frequency')?.valueChanges.subscribe(frequency => {
      const dayOfMonthControl = this.form().get('dayOfMonth');
      if (frequency === 'MONTHLY') {
        dayOfMonthControl?.setValidators([Validators.required, Validators.min(1), Validators.max(31), Validators.pattern('^[0-9]{1,2}$')]);
      } else {
        dayOfMonthControl?.setValidators([Validators.min(1), Validators.max(31), Validators.pattern('^[0-9]{1,2}$')]);
      }
      dayOfMonthControl?.updateValueAndValidity();
    });

    this.authService.user$.subscribe(user => {
      this.user = user;
      this.loading.set(false);

      const storedMsisdn = this.authService.getStoredMsisdn();
      if (storedMsisdn) {
        this.subscriptionFacade.getCustomerInfo(storedMsisdn).subscribe(customerInfo => {
          if (customerInfo) {

            this.fetchAccounts(customerInfo.id.toString(), '16112018597');
            this.billingInfo = {
              firstName: customerInfo.givenName,
              lastName: customerInfo.familyName,
              documentType: customerInfo.document.type,
              documentNumber: customerInfo.document.id,
              email: customerInfo.email,
              phone: storedMsisdn,
              country: customerInfo.address.country,
              city: customerInfo.address.city,
              address: customerInfo.address.line1,
              additionalInfo: customerInfo.additionalInformationPlaceHolder.additionalInformationString || ''
            };
          }
        });

        this.subscriptionFacade.getActiveSubscriptions(storedMsisdn).subscribe(activeSubscriptions => {
          if (activeSubscriptions) {
            this.activeSubscriptions.set(activeSubscriptions);
          }
        });
      }
    });
  }

  logout() {
    this.authService.logout();
  }

  fetchAccounts(customerId: string, subscriptionId: string) {
    this.subscriptionFacade.getAccountsForSubscription(customerId, subscriptionId).subscribe(accounts => {
      this.accounts.set(accounts);
    });
  }

  // Get error message for a specific field
  getFieldErrorMessage(fieldName: string): string {
    const control = this.form().get(fieldName);
    if (!control?.errors || !control.touched) return '';

    const firstError = Object.keys(control.errors)[0];

    // Validators.required automatically shows 'Este campo es obligatorio'
    if (firstError === 'required') return 'Este campo es obligatorio';

    // Use field-specific message for any non-required error
    return this.errorMessages[fieldName]?.[firstError] || 'Error de validación';
  }

  async onSubmit(): Promise<void> {
    /* if (!this.form().valid) return;
 
    this.isLoading.set(true);
    this.submitError.set('');
 
    try {
      await this.portabilityService.submitPortability(
        this.form().value as CustomerInformationData,
        this.donorData(),
        this.portabilityData()
      );
 
      this.formSubmit.emit(this.form().value as CustomerInformationData);
      await this.router.navigate(['/portability/successful']);
    } catch (error: any) {
      const errorMessage = error?.error?.message ||
        'Error al procesar la solicitud de portabilidad. Por favor, inténtelo de nuevo más tarde o contacte con soporte para más información.';
      this.submitError.set(errorMessage);
      console.error('Error submitting portability request:', error);
    } finally {
      this.isLoading.set(false);
    } */
  }

  onCancel() {
    // Handle cancel action
  }

  onEditClick() {

  }
}
