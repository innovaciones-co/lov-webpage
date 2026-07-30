import { DOCUMENT } from '@angular/common';
import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { CustomerSubscription } from '../../../../core/models/customer.model';
import { MsisdnPipe } from '../../../../core/pipes/msisdn.pipe';
import { DeviceDetectionService } from '../../../../core/services/device-detection.service';
import { SubscriptionFacadeService } from '../../../../core/services/subscription-facade.service';
import { AuthService } from '../../../authentication/services/auth.service';
import { OrderPaymentRequest, PaymentInitiationResponse } from '../../models/order.model';
import PaymentMethod, { PaymentMethodPayload } from '../../models/payment-method.model';
import { PaymentService } from '../../services/payment.service';
import { BillingInfoComponent } from "../billing-info/billing-info";
import { PaymentCardSelector } from "../payment-card-selector/payment-card-selector";
import { PaymentMethodOptions } from "../payment-method-options/payment-method-options";
import { SubscriptionSelector } from "../subscription-selector/subscription-selector";
import { Summary } from "../summary/summary";

@Component({
  selector: 'app-payments',
  imports: [Summary, BillingInfoComponent, PaymentMethodOptions, PaymentCardSelector, SubscriptionSelector],
  templateUrl: './payments.html',
  styleUrl: './payments.scss'
})
export class Payments implements OnInit {
  private document = inject(DOCUMENT);
  private router = inject(Router);

  customerSubscriptions = signal<CustomerSubscription[]>([]);
  currentSubscription = signal<CustomerSubscription | undefined>(undefined);
  mobileStep = signal(1);
  requiresCardStep = computed(() => this.paymentService.paymentMethod() === PaymentMethod.CARD);
  totalMobileSteps = computed(() => this.requiresCardStep() ? 3 : 2);
  mobileStepTitle = computed(() => {
    switch (this.mobileStep()) {
      case 1:
        return 'Confirma el plan y número de teléfono';
      case 2:
        return 'Elige tu método de pago';
      case 3:
        return this.requiresCardStep() ? 'Selecciona una tarjeta' : 'Pago';
      default:
        return 'Pago';
    }
  });

  constructor(
    private deviceDetectionService: DeviceDetectionService,
    private paymentService: PaymentService,
    private subscriptionFacadeService: SubscriptionFacadeService,
    private authService: AuthService,
    private msisdnPipe: MsisdnPipe
  ) {
    effect(() => {
      const maxStep = this.totalMobileSteps();

      if (this.mobileStep() > maxStep) {
        this.mobileStep.set(maxStep);
      }
    });

    effect(() => {
      const currentStep = this.mobileStep();
      const requiresCardStep = this.requiresCardStep();

      if (currentStep === 3 && !requiresCardStep) {
        this.mobileStep.set(2);
      }
    });
  }

  ngOnInit(): void {
    this.getMsisdn()
      .pipe(
        switchMap(msisdn => this.getActiveSubscription(msisdn)),
      )
      .subscribe();
  }

  isMobile(): boolean {
    return this.deviceDetectionService?.isMobile() ?? false;
  }

  canContinue() {
    return this.paymentService.canCheckout();
  }

  isMobileStep(step: number): boolean {
    return this.mobileStep() === step;
  }

  isLastMobileStep(): boolean {
    return this.mobileStep() === this.totalMobileSteps();
  }

  canGoBackMobileStep(): boolean {
    return this.mobileStep() > 1;
  }

  onSubscriptionSelected(subscriptionId: number): void {
    const selectedSubscription = this.customerSubscriptions().find(
      (subscription) => subscription.id === subscriptionId
    );

    if (!selectedSubscription) {
      return;
    }

    this.currentSubscription.set(selectedSubscription);
  }

  onContinue(): void {
    console.log('onContinue() called - starting payment flow');
    const paymentRequest = this.buildPaymentRequest();

    this.processBillingInfo()
      .pipe(
        switchMap(() => this.getMsisdn()),
        switchMap(msisdn => this.getActiveSubscription(msisdn)),
        switchMap(({ msisdn, subscriberId }) => this.createOrder(subscriberId, msisdn)),
        switchMap(({ orderId, referenceCode }) =>
          this.initiatePayment(orderId, paymentRequest).pipe(
            map(paymentData => ({ paymentData, referenceCode }))
          )
        ),
        tap(({ paymentData, referenceCode }) => this.handlePaymentResult(paymentData, paymentRequest, referenceCode)),
        catchError(error => this.handleError(error))
      )
      .subscribe();
  }

  onMobileContinue(): void {
    if (!this.isLastMobileStep()) {
      if (this.isMobileStep(1) && !this.paymentService.submitBillingInfo()) {
        return;
      }

      this.mobileStep.update(step => Math.min(step + 1, this.totalMobileSteps()));
      return;
    }

    this.onContinue();
  }

  onMobileBack(): void {
    if (!this.canGoBackMobileStep()) {
      return;
    }

    this.mobileStep.update(step => Math.max(step - 1, 1));
  }

  private handlePaymentResult(paymentData: PaymentInitiationResponse, paymentRequest: OrderPaymentRequest, referenceCode?: string): void {
    if ((paymentRequest.paymentMethodType === PaymentMethod.BALANCE || paymentRequest.paymentMethodType === PaymentMethod.CARD) && paymentData.checkoutUrl === null) {
      console.log('Payment method BALANCE or CARD with no checkout URL detected, skipping checkout form submission');

      void this.router.navigate(['pagos/resultado'], {
        queryParams: { referenceCode }
      });
      return;
    }

    this.submitPaymentForm(paymentData);
  }

  /**
   * Validates and submits billing information
   * @returns Observable that emits when billing info is valid
   */
  private processBillingInfo(): Observable<void> {
    console.log('Starting processBillingInfo...');
    const success = this.paymentService.submitBillingInfo();
    console.log('submitBillingInfo result:', success);

    if (success) {
      console.log('Billing info submitted successfully, proceeding to next step');
      return of(undefined);
    }

    console.log('Billing info validation failed - this will stop the RxJS chain');
    return throwError(() => new Error('Billing info validation failed, please check the form'));
  }

  /**
   * Retrieves MSISDN from auth service or billing info
   * @returns Observable with the MSISDN
   */
  private getMsisdn(): Observable<string> {
    console.log('Attempting to retrieve MSISDN from AuthService or BillingInfo');
    const msisdn = this.authService.getStoredMsisdn() || this.paymentService?.billingInfo()?.phone;

    console.log('Retrieved MSISDN:', msisdn);

    if (!msisdn) {
      return throwError(() => new Error('MSISDN is required but not available'));
    }

    return of(this.msisdnPipe.transform(msisdn));
  }

  /**
   * Fetches active subscriptions and returns the first one
   * @param msisdn The MSISDN to get subscriptions for
   * @returns Observable with MSISDN and subscriber ID
   */
  private getActiveSubscription(msisdn: string): Observable<{ msisdn: string; subscriberId: number }> {
    return this.subscriptionFacadeService.getActiveSubscriptions(msisdn).pipe(
      tap(subscriptions => console.log('Fetched active subscriptions:', subscriptions)),
      switchMap(subscriptions => {
        if (subscriptions.length === 0) {
          return throwError(() => new Error(`No active subscriptions found for MSISDN: ${msisdn}`));
        }

        const selectedSubscription = this.resolveSelectedSubscription(subscriptions);

        this.customerSubscriptions.set(subscriptions);
        this.currentSubscription.set(selectedSubscription);

        const subscriberId = selectedSubscription.id;
        return of({ msisdn, subscriberId });
      })
    );
  }

  private resolveSelectedSubscription(subscriptions: CustomerSubscription[]): CustomerSubscription {
    const currentSubscriptionId = this.currentSubscription()?.id;
    if (!currentSubscriptionId) {
      return subscriptions[0];
    }

    return subscriptions.find(subscription => subscription.id === currentSubscriptionId) ?? subscriptions[0];
  }

  /**
   * Creates an order using the payment service
   * @param subscriberId The subscriber ID
   * @param msisdn The MSISDN
   * @returns Observable with order ID and reference code
   */
  private createOrder(subscriberId: number, msisdn: string): Observable<{ orderId: string; referenceCode: string }> {
    return this.paymentService.createOrderFromCurrentState(subscriberId, msisdn);
  }

  /**
   * Initiates payment for the created order
   * @param orderId The order ID to initiate payment for
   * @returns Observable with the payment initiation response
   */
  private initiatePayment(orderId: string, paymentRequest: OrderPaymentRequest): Observable<PaymentInitiationResponse> {
    console.log('Initiating payment for order ID:', orderId);
    return this.paymentService.initiatePayment(orderId, paymentRequest);
  }

  private buildPaymentRequest(): OrderPaymentRequest {
    const selectedMethod = this.paymentService.paymentMethod();

    if (!selectedMethod) {
      throw new Error('No payment method selected');
    }

    return {
      paymentMethodType: selectedMethod,
      cardData: selectedMethod == PaymentMethod.CARD ? this.getDefaultCardData() : undefined,
      creditCardId: selectedMethod == PaymentMethod.CARD ? this.paymentService.selectedCreditCard()?.id : undefined
    };
  }

  private getDefaultCardData(): PaymentMethodPayload { // TODO: Populate with actual card data from form or service
    const selectedCreditCard = this.paymentService.selectedCreditCard(); // This is just a placeholder; replace with actual card data retrieval logic

    if (!selectedCreditCard) {
      throw new Error('No credit card selected for payment');
    }

    return selectedCreditCard!;
  }

  /**
   * Submits the payment form to PayU checkout
   * @param paymentData The payment initiation response containing form data
   */
  private submitPaymentForm(paymentData: PaymentInitiationResponse): void {
    console.log('Submitting payment form to PayU:', paymentData);
    const checkoutAction = paymentData.checkoutData.action || paymentData.checkoutUrl;

    // Create a form element
    const form = this.document.createElement('form');
    form.method = 'post';
    form.action = checkoutAction;
    form.style.display = 'none';

    // Add all payment fields as hidden inputs
    Object.entries(paymentData.checkoutData.fields).forEach(([key, value]) => {
      const input = this.document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = String(value);
      form.appendChild(input);
    });

    // Append form to body, submit, and remove
    this.document.body.appendChild(form);
    form.submit();
    this.document.body.removeChild(form);
  }

  /**
   * Handles errors during the payment flow
   * @param error The error that occurred
   * @returns Observable that completes (to prevent re-subscription)
   */
  private handleError(error: Error): Observable<never> {
    console.error('Payment flow error:', error.message);

    // TODO: Show user-friendly error message
    // this.notificationService.showError(error.message);

    return of() as Observable<never>;
  }
}
