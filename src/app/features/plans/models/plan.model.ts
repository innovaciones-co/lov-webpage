import { ProductType } from "../../payments/models/product.model";

export interface Plan {
    id: number;
    name: string;
    image: string;
    description: string | null;
    price: number;
    totalPrice: number;
    totalTax: number;
    tariffId: number;
    validity: number;
    promoImage: string | null;
    features: Feature[];
    operator: number;
    category: number;
    active: boolean;
    isActive: boolean;
    productType: ProductType;
    smsQuantity: number;
    voiceQuantity: number;
    dataQuantity: number;
    order: number;
}

export interface Feature {
    id: number;
    name: string;
    description: string | null;
    icon: string | null;
    type: Type;
    quantity: number;
    measure: Measure;
    customClass: string | null;
    plan: number[];
    mainFeature: boolean;
    isMainFeature: boolean;
}

export enum Measure {
    GB = "GB",
    MB = "MB",
    Minute = "MINUTE",
    SMS = "SMS",
}

export enum Type {
    Internet = "INTERNET",
    Mobile = "MOBILE",
}