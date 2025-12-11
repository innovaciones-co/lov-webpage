export interface Subscription {
    activationDate?: string;
    currentDevice?: any;
    customerId?: string;
    iccid: string;
    id?: number;
    imsi?: string;
    initialDevice?: any;
    isPhoneDirectoryRegistered?: boolean;
    msisdn?: string;
    paymentType?: string;
    phoneDirectoryRegistered?: boolean;
    providerId?: number;
    state?: string;
    tariff?: {
        tariffId: number;
        tariffName: string;
    };
    type?: string;
}