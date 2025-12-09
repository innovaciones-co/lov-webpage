import { computed, Injectable, Signal, signal } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { BillingInfo } from "../models/billing-info.model";
import { Product } from "../models/product.model";

@Injectable({
    providedIn: 'root'
})
export class PaymentService {
    billingInfo = signal<BillingInfo | undefined>(undefined);
    billingForm = signal<FormGroup | undefined>(undefined);
    selectedProduct = signal<Product | undefined>(undefined);
    private _formValid = signal<boolean>(false);

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
}