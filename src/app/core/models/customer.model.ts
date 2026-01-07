export interface CustomerAddress {
  city: string;
  country: string;
  line1: string;
  state: string;
}

export interface CustomerDocument {
  id: string;
  type: string;
}

export interface CustomerContacts {
  portalAccount: string;
}

export interface AdditionalInformationPlaceHolder {
  additionalInformationString: string | null;
}

export interface Device {
  // Define specific device properties as needed
  [key: string]: any;
}

export interface Tariff {
  tariffId: number;
  tariffName: string;
}

export interface CustomerSubscription {
  activationDate: string;
  currentDevice: Device;
  customerId: string;
  iccid: string;
  id: number;
  imsi: string;
  initialDevice: Device;
  isPhoneDirectoryRegistered: boolean;
  msisdn: string;
  paymentType: 'PREPAID' | 'POSTPAID';
  phoneDirectoryRegistered: boolean;
  providerId: number;
  state: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  tariff: Tariff;
  type: 'MOBILE' | 'FIXED';
}

export interface Customer {
  additionalInformationPlaceHolder: AdditionalInformationPlaceHolder;
  address: CustomerAddress;
  childCustomerIds: number[] | null;
  consentToShareData: boolean;
  contacts: CustomerContacts;
  customerType: 'RESIDENTIAL' | 'BUSINESS';
  document: CustomerDocument;
  email: string;
  emailVerified: boolean;
  familyName: string;
  givenName: string;
  id: number;
  languageId: string | null;
  lastModified: string;
  optedOutFromHouseholdDataShare: boolean;
  parentCustomerId: number | null;
  providerId: number;
  registrationChannel: string;
  registrationDate: string;
  state: 'ACTIVE' | 'INACTIVE';
  subscriptions: CustomerSubscription[];
}

export type CustomerSubscriptionResponse = Customer;