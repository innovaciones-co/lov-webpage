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
            plan.totalPrice,
            plan.totalTax,
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
        const productPrice = price ?? amount;

        return new RechargeProduct(
            id,
            `Recarga de saldo`,
            `Recarga de saldo por $${amount.toLocaleString()} COP para el número ${id}`,
            productPrice / 1.19, // base price before tax
            productPrice,
            productPrice * 0.19,
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