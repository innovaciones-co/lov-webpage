import { Plan } from '../../plans/models/plan.model';

// Base abstract product class
export abstract class Product {
    constructor(
        public id: string,
        public name: string,
        public description: string,
        public price: number,
        public productType: ProductType,
        public imageUrl?: string
    ) { }

    // Abstract methods that must be implemented by subclasses
    abstract getDisplayName(): string;
    abstract getDisplayDescription(): string;
    abstract getDisplayPrice(): string;
    abstract getSummaryView(): ProductSummaryView;
    abstract getProductType(): ProductType;
}

// Product types enum
export enum ProductType {
    BUNDLE = 'BUNDLE',
    TOPUP = 'TOPUP',
    PLAN = 'PLAN'
}

// Interface for summary view data
export interface ProductSummaryView {
    title: string;
    subtitle?: string;
    price: string;
    details: string[];
    imageUrl?: string;
    type: ProductType;
}

// Plan Product implementation
export class PlanProduct extends Product {
    constructor(
        id: string,
        name: string,
        description: string,
        price: number,
        public plan: Plan,
        productType: ProductType,
        imageUrl?: string
    ) {
        super(id, name, description, price, productType, imageUrl);
    }

    getDisplayName(): string {
        return this.plan.name;
    }

    getDisplayDescription(): string {
        console.log('Plan description:', this.plan.description);
        return this.plan.description || this.description;
    }

    getDisplayPrice(): string {
        return `$${this.price.toLocaleString()} COP`;
    }

    getSummaryView(): ProductSummaryView {
        const mainFeatures = this.plan.features
            //.filter(f => f.mainFeature || f.isMainFeature)
            .map(f => `${f.name}`);

        return {
            title: this.getDisplayName(),
            subtitle: `Plan ${this.plan.validity} días`,
            price: this.getDisplayPrice(),
            details: mainFeatures.length > 0 ? mainFeatures : [this.getDisplayDescription()],
            imageUrl: this.plan.image || this.imageUrl,
            type: ProductType.BUNDLE
        };
    }

    getProductType(): ProductType {
        return this.productType;
    }
}

// Recharge Product implementation
export class RechargeProduct extends Product {
    constructor(
        id: string,
        name: string,
        description: string,
        price: number,
        public amount: number,
        imageUrl?: string,
        productType = ProductType.TOPUP
    ) {
        super(id, name, description, price, productType, imageUrl);
    }

    getDisplayName(): string {
        return `Recarga $${this.amount.toLocaleString()}`;
    }

    getDisplayDescription(): string {
        return `Recarga de saldo por $${this.amount.toLocaleString()} COP`;
    }

    getDisplayPrice(): string {
        return `$${this.price.toLocaleString()} COP`;
    }

    getSummaryView(): ProductSummaryView {
        return {
            title: this.getDisplayName(),
            subtitle: 'Recarga de saldo',
            price: this.getDisplayPrice(),
            details: [
                `Saldo a recargar: $${this.amount.toLocaleString()} COP`,
                'Disponible inmediatamente después del pago'
            ],
            imageUrl: this.imageUrl,
            type: ProductType.TOPUP
        };
    }

    getProductType(): ProductType {
        return ProductType.TOPUP;
    }
}