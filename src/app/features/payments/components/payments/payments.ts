import { Component } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { MsisdnPipe } from '../../../../core/pipes/msisdn.pipe';
import { DeviceDetectionService } from '../../../../core/services/device-detection.service';
import { SubscriptionFacadeService } from '../../../../core/services/subscription-facade.service';
import { AuthService } from '../../../authentication/services/auth.service';
import { PaymentService } from '../../services/payment.service';
import { BillingInfoComponent } from "../billing-info/billing-info";
import { Summary } from "../summary/summary";

@Component({
  selector: 'app-payments',
  imports: [Summary, BillingInfoComponent],
  templateUrl: './payments.html',
  styleUrl: './payments.scss'
})
export class Payments {
  constructor(
    private deviceDetectionService: DeviceDetectionService,
    private paymentService: PaymentService,
    private subscriptionFacadeService: SubscriptionFacadeService,
    private authService: AuthService,
    private msisdnPipe: MsisdnPipe
  ) { }

  isMobile(): boolean {
    return this.deviceDetectionService?.isMobile() ?? false;
  }

  canContinue() {
    return this.paymentService.canCheckout();
  }

  onContinue(): void {
    console.log('onContinue() called - starting payment flow');
    this.processBillingInfo()
      .pipe(
        switchMap(() => this.getMsisdn()),
        switchMap(msisdn => this.getActiveSubscription(msisdn)),
        switchMap(({ msisdn, subscriberId }) => this.createOrder(subscriberId, msisdn)),
        tap(orderId => this.handleOrderSuccess(orderId)),
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

        const subscriberId = subscriptions[0].id;
        return of({ msisdn, subscriberId });
      })
    );
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
   * Handles successful order creation
   * @param orderId The created order ID
   */
  private handleOrderSuccess(orderId: string): void {
    console.log('Order created successfully with ID:', orderId);
    // TODO: Navigate to payment gateway or confirmation step
    // this.router.navigate(['/payment-gateway'], { queryParams: { orderId } });
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
