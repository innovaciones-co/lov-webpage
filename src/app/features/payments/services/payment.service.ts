import { computed, Injectable, Signal, signal } from "@angular/core";
import { BillingInfo } from "../models/billing-info.model";

@Injectable({
    providedIn: 'root'
})
export class PaymentService {
    billingInfo = signal<BillingInfo | undefined>(undefined);
    canCheckout: Signal<boolean> = computed(() => {
        console.log('Evaluating canCheckout', this.billingInfo() !== undefined);
        return this.billingInfo() !== undefined;
    });
}