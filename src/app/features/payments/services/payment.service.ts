import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { computed, inject, Injectable, Signal, signal } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { environment } from "../../../../environments/environment";
import { BillingInfo } from "../models/billing-info.model";
import { CreateOrderRequest, OrderErrorResponse, OrderItem, PaymentInitiationResponse } from "../models/order.model";
import { Product, ProductType } from "../models/product.model";

@Injectable({
    providedIn: 'root'
})
export class PaymentService {
    billingInfo = signal<BillingInfo | undefined>(undefined);
    billingForm = signal<FormGroup | undefined>(undefined);
    selectedProduct = signal<Product | undefined>(undefined);
    private _formValid = signal<boolean>(false);
    private httpClient = inject(HttpClient);

    canCheckout: Signal<boolean> = computed(() => {
        return this._formValid() && this.selectedProduct() !== undefined;
    });

    setFormValidityStatus(isValid: boolean) {
        this._formValid.set(isValid);
    }

    selectProduct(product: Product) {
        this.selectedProduct.set(product);
        console.log('Product selected:', product.getSummaryView());
    }

    clearProduct() {
        this.selectedProduct.set(undefined);
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
        console.log('Billing info submitted:', billingInfo);
        console.log('Selected product:', product.getSummaryView());
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
    initiatePayment(orderId: string): Observable<PaymentInitiationResponse> {
        const url = `${environment.apiUrl}/orders/${orderId}/pay`;

        return this.httpClient.put<PaymentInitiationResponse>(url, {}, {
            headers: {
                'accept': 'application/json'
            }
        }).pipe(
            catchError(this.handleOrderError)
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
            tax: this.calculateTax(product.basePrice),
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
     * Calculates tax for a given price (currently 19% IVA for Colombia)
     * @param price The base price
     * @returns The tax amount
     */
    private calculateTax(price: number): number {
        return price * 0.19; // 19% IVA
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
}