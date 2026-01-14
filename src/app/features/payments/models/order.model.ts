export interface CreateOrderRequest {
    description: string;
    referenceCode: string;
    currency: string;
    buyerEmail: string;
    details: OrderDetails;
    subscriberId: number;
    msisdn: string;
    buyerPhone: string;
    buyerFullName: string;
    buyerDocumentType: string;
    buyerDocument: string;
    billingCountry: string;
    billingCity: string;
    billingAddress: string;
}

export interface OrderDetails {
    items: OrderItem[];
}

export interface OrderItem {
    name: string;
    quantity: number;
    price: number;
    productId: string;
    tax: number;
    taxReturnBase: number;
    type: OrderItemType;
}

export enum OrderItemType {
    BUNDLE = 'BUNDLE'
}

export interface FieldError {
    code: string;
    message: string;
    property: string;
    rejectedValue: any;
    path: string;
}

export interface OrderErrorResponse {
    status: number;
    code: string;
    message: string;
    fieldErrors: FieldError[];
}