
export interface BillingInfo {
    firstName: string;
    lastName: string;
    documentType: string;
    documentNumber: number;
    email: string;
    phone: string;
    country: string;
    city: string;
    address: string;
    additionalInfo?: string;
}