import { Injectable } from '@angular/core';
import { Plan } from '../../plans/models/plan.model';
import { PlanProduct, Product, RechargeProduct } from '../models/product.model';

@Injectable({
    providedIn: 'root'
})
export class ProductFactoryService {

    /**
     * Creates a PlanProduct from a Plan
     */
    createPlanProduct(plan: Plan): PlanProduct {
        return new PlanProduct(
            plan.id.toString(),
            plan.name,
            plan.description || '',
            plan.price,
            plan,
            plan.productType,
            plan.image,
        );
    }

    /**
     * Creates a RechargeProduct for cash recharge
     */
    createRechargeProduct(
        id: string,
        amount: number,
        price?: number,
        imageUrl?: string
    ): RechargeProduct {
        // If no price is provided, use the amount as price (1:1 ratio)
        const productPrice = price ?? amount;

        return new RechargeProduct(
            id,
            `Recarga $${amount.toLocaleString()}`,
            `Recarga de saldo por $${amount.toLocaleString()} COP`,
            productPrice,
            amount,
            imageUrl
        );
    }

    /**
     * Convert Plan array to PlanProduct array
     */
    convertPlansToProducts(plans: Plan[]): PlanProduct[] {
        return plans
            .filter(plan => plan.active || plan.isActive)
            .map(plan => this.createPlanProduct(plan));
    }

    /**
     * Generic method to create products from different sources
     */
    createProductsFromMixed(
        plans: Plan[] = [],
        rechargeAmounts: number[] = []
    ): Product[] {
        const products: Product[] = [];

        // Add plan products
        products.push(...this.convertPlansToProducts(plans));

        // Add recharge products
        rechargeAmounts.forEach((amount, index) => {
            products.push(
                this.createRechargeProduct(`recharge-${amount}`, amount)
            );
        });

        return products;
    }
}