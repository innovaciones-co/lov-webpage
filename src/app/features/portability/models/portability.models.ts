import { Subscription } from "../../../core/models/subscription.model";

export interface SubscriptionResponse {
    additionalInformationPlaceHolder?: {
        additionalInformationString?: string | null;
    };
    address?: {
        city: string;
        country: string;
        line1: string;
        state: string;
    };
    childCustomerIds?: any;
    consentToShareData?: boolean;
    contacts?: {
        portalAccount: string;
    };
    customerType?: string;
    document?: {
        id: string;
        type: string;
    };
    email?: string;
    emailVerified?: boolean;
    familyName?: string;
    givenName?: string;
    id?: number;
    languageId?: any;
    lastModified?: string;
    optedOutFromHouseholdDataShare?: boolean;
    parentCustomerId?: any;
    providerId?: number;
    registrationChannel?: string;
    registrationDate?: string;
    state?: string;
    subscriptions: Subscription[];
}

export interface LookupResponse {
    msisdn: string;
    operatorCode: string;
    operatorName: string;
    routingCode: string;
}