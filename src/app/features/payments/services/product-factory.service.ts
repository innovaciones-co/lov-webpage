import { Injectable } from '@angular/core';
import { Plan } from '../../plans/models/plan.model';
import { Product, PlanProduct, RechargeProduct } from '../models/product.model';

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
            plan.image
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
     * Creates predefined recharge amounts
     */
    getAvailableRecharges(): RechargeProduct[] {
        const rechargeAmounts = [
            { id: 'recharge-5000', amount: 5000 },
            { id: 'recharge-10000', amount: 10000 },
            { id: 'recharge-20000', amount: 20000 },
            { id: 'recharge-50000', amount: 50000 },
            { id: 'recharge-100000', amount: 100000 }
        ];

        return rechargeAmounts.map(item => 
            this.createRechargeProduct(item.id, item.amount)
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