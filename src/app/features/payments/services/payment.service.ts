import { computed, Injectable, Signal, signal } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { BillingInfo } from "../models/billing-info.model";

@Injectable({
    providedIn: 'root'
})
export class PaymentService {
    billingInfo = signal<BillingInfo | undefined>(undefined);
    billingForm = signal<FormGroup | undefined>(undefined);
    private _formValid = signal<boolean>(false);
    
    canCheckout: Signal<boolean> = computed(() => this._formValid());

    setFormValidityStatus(isValid: boolean) {
        this._formValid.set(isValid);
    }

    submitBillingInfo(): boolean {
        const form = this.billingForm();
        if (!form || !form.valid) {
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
        return true;
    }
}