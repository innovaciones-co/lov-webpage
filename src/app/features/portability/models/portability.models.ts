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

export interface PortabilityStatusPayload {
    donor?: string;
    donorName?: string;
    errorMessage?: string;
    health?: string;
    msisdn?: string;
    newMsisdn?: string;
    nipCounter?: number;
    portingDate?: string;
    portingRequestId?: string;
    processId?: number;
    recipientCode?: string;
    state?: string;
    type?: string;
}

export interface PortabilityStatusResponse {
    correlationId: string;
    payload: PortabilityStatusPayload;
    providerId: number;
    responseCode: number;
    responseDetail: string;
    transactionId: string;
}
