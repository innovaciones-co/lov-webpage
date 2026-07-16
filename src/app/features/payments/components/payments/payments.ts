import { DOCUMENT } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { CustomerSubscription } from '../../../../core/models/customer.model';
import { MsisdnPipe } from '../../../../core/pipes/msisdn.pipe';
import { DeviceDetectionService } from '../../../../core/services/device-detection.service';
import { SubscriptionFacadeService } from '../../../../core/services/subscription-facade.service';
import { AuthService } from '../../../authentication/services/auth.service';
import { PaymentInitiationResponse } from '../../models/order.model';
import { PaymentService } from '../../services/payment.service';
import { BillingInfoComponent } from "../billing-info/billing-info";
import { PaymentCardSelector } from "../payment-card-selector/payment-card-selector";
import { PaymentMethodOptions } from "../payment-method-options/payment-method-options";
import { Summary } from "../summary/summary";
import { SubscriptionSelector } from "../subscription-selector/subscription-selector";

@Component({
  selector: 'app-payments',
  imports: [Summary, BillingInfoComponent, PaymentMethodOptions, PaymentCardSelector, SubscriptionSelector],
  templateUrl: './payments.html',
  styleUrl: './payments.scss'
})
export class Payments implements OnInit {
  private document = inject(DOCUMENT);

  customerSubscriptions = signal<CustomerSubscription[]>([]);
  currentSubscription = signal<CustomerSubscription | undefined>(undefined);

  constructor(
    private deviceDetectionService: DeviceDetectionService,
    private paymentService: PaymentService,
    private subscriptionFacadeService: SubscriptionFacadeService,
    private authService: AuthService,
    private msisdnPipe: MsisdnPipe
  ) { }


  ngOnInit(): void {
    this.getMsisdn()
      .pipe(
        switchMap(msisdn => this.getActiveSubscription(msisdn)),
      )
      .subscribe();

    this.paymentService.setFormValidityStatus(true);
  }

  isMobile(): boolean {
    return this.deviceDetectionService?.isMobile() ?? false;
  }

  canContinue() {
    return this.paymentService.canCheckout();
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
    this.processBillingInfo()
      .pipe(
        switchMap(() => this.getMsisdn()),
        switchMap(msisdn => this.getActiveSubscription(msisdn)),
        switchMap(({ msisdn, subscriberId }) => this.createOrder(subscriberId, msisdn)),
        switchMap(orderId => this.initiatePayment(orderId)),
        tap(paymentData => this.submitPaymentForm(paymentData)),
        catchError(error => this.handleError(error))
      )
      .subscribe();
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
   * @returns Observable with the order ID
   */
  private createOrder(subscriberId: number, msisdn: string): Observable<string> {
    return this.paymentService.createOrderFromCurrentState(subscriberId, msisdn);
  }

  /**
   * Initiates payment for the created order
   * @param orderId The order ID to initiate payment for
   * @returns Observable with the payment initiation response
   */
  private initiatePayment(orderId: string): Observable<PaymentInitiationResponse> {
    console.log('Initiating payment for order ID:', orderId);
    return this.paymentService.initiatePayment(orderId);
  }

  /**
   * Submits the payment form to PayU checkout
   * @param paymentData The payment initiation response containing form data
   */
  private submitPaymentForm(paymentData: PaymentInitiationResponse): void {
    console.log('Submitting payment form to PayU:', paymentData);

    // Create a form element
    const form = this.document.createElement('form');
    form.method = 'post';
    form.action = paymentData.action;
    form.style.display = 'none';

    // Add all payment fields as hidden inputs
    Object.entries(paymentData.fields).forEach(([key, value]) => {
      const input = this.document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
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
