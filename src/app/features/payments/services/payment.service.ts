import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { computed, inject, Injectable, OnDestroy, Signal, signal } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { Observable, Subject, throwError, timer } from "rxjs";
import { catchError, map, retry, share, switchMap, takeUntil, takeWhile } from "rxjs/operators";
import { environment } from "../../../../environments/environment";
import { Plan } from "../../plans/models/plan.model";
import { BillingInfo } from "../models/billing-info.model";
import { CreateOrderRequest, OrderErrorResponse, OrderItem, OrderPaymentRequest, OrderResponse, PaymentInitiationResponse, PaymentStatus } from "../models/order.model";
import PaymentMethod, { PaymentMethodPayload } from "../models/payment-method.model";
import { PlanProduct, Product, ProductType, RechargeProduct } from "../models/product.model";

@Injectable({
    providedIn: 'root'
})
export class PaymentService implements OnDestroy {
    private static readonly SELECTED_PRODUCT_STORAGE_KEY = 'payment.selectedProduct';

    billingInfo = signal<BillingInfo | undefined>(undefined);
    billingForm = signal<FormGroup | undefined>(undefined);
    selectedProduct = signal<Product | undefined>(undefined);
    paymentMethod = signal<PaymentMethod | undefined>(undefined);
    selectedCreditCard = signal<PaymentMethodPayload | undefined>(undefined);

    private _formValid = signal<boolean>(false);
    private httpClient = inject(HttpClient);
    private stopPolling = new Subject<void>();

    constructor() {
        this.restoreSelectedProduct();
    }

    canCheckout: Signal<boolean> = computed(() => {
        return this._formValid()
            && this.selectedProduct() !== undefined
            && this.paymentMethod() !== undefined
            && (this.paymentMethod() !== PaymentMethod.CARD || this.selectedCreditCard() !== undefined);
    });

    setFormValidityStatus(isValid: boolean) {
        this._formValid.set(isValid);
    }

    selectProduct(product: Product) {
        this.selectedProduct.set(product);
        this.saveSelectedProduct(product);
        console.log('Product selected:', product.getSummaryView());
    }

    setSelectedCreditCard(paymentMethodPayload: PaymentMethodPayload | undefined): void {
        this.selectedCreditCard.set(paymentMethodPayload);
    }

    clearProduct() {
        this.selectedProduct.set(undefined);
        this.selectedCreditCard.set(undefined);
        this.removeSelectedProductFromStorage();
    }

    submitBillingInfo(): boolean {
        const form = this.billingForm();
        const product = this.selectedProduct();

        if (!form || !form.valid || !product) {
            // Mark all fields as touched to show validation errors
            if (form) {
                Object.keys(form.controls).forEach(key => {
                    form.get(key)?.markAsTouched();
                });
            }
            return false;
        }

        const formValue = form.value;
        const billingInfo: BillingInfo = {
            firstName: formValue.firstName!,
            lastName: formValue.lastName!,
            documentType: formValue.documentType!,
            documentNumber: Number(formValue.documentNumber!),
            email: formValue.email!,
            phone: formValue.phone!,
            country: formValue.country!,
            city: formValue.city!,
            address: formValue.address!,
            additionalInfo: formValue.additionalInfo || undefined
        };

        this.billingInfo.set(billingInfo);
        return true;
    }

    /**
     * Creates an order with the payment service
     * @param orderData The order creation request data
     * @returns Observable with the order ID string on success
     */
    createOrder(orderData: CreateOrderRequest): Observable<string> {
        const url = `${environment.apiUrl}/orders`;

        return this.httpClient.post<string>(url, orderData, {
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json'
            },
            responseType: 'text' as 'json' // The API returns a string, not JSON
        }).pipe(
            map(response => {
                // Remove quotes if the response is a JSON string like "orderId123"
                try {
                    return JSON.parse(response);
                } catch {
                    // If parsing fails, return the response as-is
                    return response;
                }
            }),
            catchError(this.handleOrderError)
        );
    }

    /**
     * Creates an order using the current billing info and selected product
     * @param subscriberId The subscriber ID for the order
     * @param msisdn The MSISDN in E.164 format (e.g., +1234567890)
     * @param referenceCode Optional reference code, will be generated if not provided
     * @returns Observable with the order ID string on success
     */
    createOrderFromCurrentState(subscriberId: number, msisdn: string, referenceCode?: string): Observable<string> {
        const billingInfo = this.billingInfo();
        const product = this.selectedProduct();

        if (!billingInfo || !product) {
            return throwError(() => new Error('Billing info and product must be selected before creating an order'));
        }

        const orderRequest = this.buildOrderRequest(billingInfo, product, subscriberId, msisdn, referenceCode);
        return this.createOrder(orderRequest);
    }

    /**
     * Initiates payment for an existing order
     * @param orderId The order ID to initiate payment for
     * @returns Observable with the payment initiation response containing PayU form data
     */
    initiatePayment(orderId: string, paymentRequest: OrderPaymentRequest): Observable<PaymentInitiationResponse> {
        const url = `${environment.apiUrl}/orders/${orderId}/payment`;

        return this.httpClient.post<PaymentInitiationResponse>(url, paymentRequest, {
            headers: {
                'accept': 'application/json'
            }
        }).pipe(
            catchError(this.handleOrderError)
        );
    }

    /**
     * Fetches an order by its reference code
     * @param referenceCode The reference code to look up
     * @returns Observable with the order response
     */
    getOrderByReferenceCode(referenceCode: string): Observable<OrderResponse> {
        const url = `${environment.apiUrl}/orders/byReferenceCode/${referenceCode}`;


        return this.httpClient.get<OrderResponse>(url, {
            headers: {
                'accept': 'application/json'
            }
        }).pipe(
            catchError(this.handleOrderError),
            map(order => {
                console.log('Order fetched by reference code:', order);
                return order;
            })
        );
    }

    pullOrderByReferenceCode(referenceCode: string): Observable<OrderResponse> {
        const url = `${environment.apiUrl}/orders/byReferenceCode/${referenceCode}`;

        return timer(1, 1000).pipe(
            switchMap(() => this.httpClient.get<OrderResponse>(url, {
                headers: {
                    'accept': 'application/json'
                }
            }).pipe(
                catchError(this.handleOrderError),
                map(order => {
                    console.log('Order pulled by reference code:', order);
                    return order;
                })
            )),
            takeWhile(order => this.isProcessingStatus(order.paymentStatus), true),
            retry(),
            share(),
            takeUntil(this.stopPolling),
        );
    }

    /**
     * Builds a CreateOrderRequest from billing info and product data
     * @param billingInfo The billing information
     * @param product The selected product
     * @param subscriberId The subscriber ID
     * @param msisdn The MSISDN in E.164 format
     * @param referenceCode Optional reference code
     * @returns CreateOrderRequest object
     */
    private buildOrderRequest(
        billingInfo: BillingInfo,
        product: Product,
        subscriberId: number,
        msisdn: string,
        referenceCode?: string
    ): CreateOrderRequest {
        const orderItem: OrderItem = {
            name: product.name,
            quantity: 1,
            price: product.totalPrice,
            productId: product.id,
            tax: product.totalTax,
            taxReturnBase: 0,
            type: product.getProductType()
        };

        const e164msisdn = msisdn.startsWith('+') ? msisdn : `+${msisdn}`;

        return {
            description: product.name,
            referenceCode: referenceCode || this.generateReferenceCode(),
            currency: 'COP',
            buyerEmail: billingInfo.email,
            details: {
                items: [orderItem]
            },
            subscriberId,
            msisdn: e164msisdn,
            buyerPhone: billingInfo.phone,
            buyerFullName: billingInfo.firstName + ' ' + billingInfo.lastName,
            buyerDocumentType: billingInfo.documentType,
            buyerDocument: billingInfo.documentNumber.toString(),
            billingCountry: billingInfo.country,
            billingCity: billingInfo.city,
            billingAddress: billingInfo.address,
        };
    }

    /**
     * Generates a unique reference code for the order
     * @returns A unique reference code
     */
    private generateReferenceCode(): string {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        return `LOV-${timestamp}-${random}`.toUpperCase();
    }

    /**
     * Handles HTTP errors from order creation
     * @param error The HTTP error response
     * @returns Observable error with formatted error information
     */
    private handleOrderError = (error: HttpErrorResponse): Observable<never> => {
        let errorMessage = 'An unexpected error occurred';

        if (error.error) {
            try {
                const orderError: OrderErrorResponse = typeof error.error === 'string'
                    ? JSON.parse(error.error)
                    : error.error;

                if (orderError.fieldErrors && orderError.fieldErrors.length > 0) {
                    errorMessage = orderError.fieldErrors
                        .map(fieldError => `${fieldError.property}: ${fieldError.message}`)
                        .join(', ');
                } else {
                    errorMessage = orderError.message || errorMessage;
                }
            } catch {
                errorMessage = error.error?.message || error.message || errorMessage;
            }
        }

        console.error('Order creation failed:', error);
        return throwError(() => new Error(errorMessage));
    }

    isProcessingStatus(status: PaymentStatus): boolean {
        return status === 'INITIATED' || status === 'PENDING';
    }

    private saveSelectedProduct(product: Product): void {
        if (typeof localStorage === 'undefined') {
            return;
        }

        localStorage.setItem(
            PaymentService.SELECTED_PRODUCT_STORAGE_KEY,
            JSON.stringify(product)
        );
    }

    private restoreSelectedProduct(): void {
        if (typeof localStorage === 'undefined') {
            return;
        }

        const storedProduct = localStorage.getItem(PaymentService.SELECTED_PRODUCT_STORAGE_KEY);
        if (!storedProduct) {
            return;
        }

        try {
            const parsedProduct = JSON.parse(storedProduct) as Partial<PlanProduct & RechargeProduct>;
            const hydratedProduct = this.hydrateStoredProduct(parsedProduct);

            if (!hydratedProduct) {
                this.removeSelectedProductFromStorage();
                return;
            }

            this.selectedProduct.set(hydratedProduct);
        } catch {
            this.removeSelectedProductFromStorage();
        }
    }

    private hydrateStoredProduct(storedProduct: Partial<PlanProduct & RechargeProduct>): Product | undefined {
        if (!storedProduct.id || !storedProduct.name) {
            return undefined;
        }

        if (storedProduct.productType === ProductType.TOPUP) {
            if (storedProduct.totalPrice === undefined) {
                return undefined;
            }

            const totalTax = storedProduct.totalTax ?? storedProduct.totalPrice * 0.19;
            const basePrice = storedProduct.basePrice ?? storedProduct.totalPrice - totalTax;

            return new RechargeProduct(
                storedProduct.id,
                storedProduct.name,
                storedProduct.description ?? `Recarga de saldo por $${storedProduct.totalPrice.toLocaleString()} COP para el número ${storedProduct.id}`,
                basePrice,
                storedProduct.totalPrice,
                totalTax,
                storedProduct.imageUrl,
                ProductType.TOPUP,
            );
        }

        const plan = storedProduct.plan as Plan | undefined;
        if (!plan) {
            return undefined;
        }

        return new PlanProduct(
            String(storedProduct.id),
            storedProduct.name,
            storedProduct.description ?? plan.description ?? '',
            storedProduct.basePrice ?? plan.price,
            storedProduct.totalPrice ?? plan.totalPrice,
            storedProduct.totalTax ?? plan.totalTax,
            plan,
            storedProduct.productType ?? ProductType.BUNDLE,
            storedProduct.imageUrl ?? plan.image,
        );
    }

    private removeSelectedProductFromStorage(): void {
        if (typeof localStorage === 'undefined') {
            return;
        }

        localStorage.removeItem(PaymentService.SELECTED_PRODUCT_STORAGE_KEY);
    }

    ngOnDestroy() {
        this.stopPolling.next();
        this.stopPolling.complete();
    }
}
