export interface AccountUnit {
    currencyId: number;
    id: number;
    mantissa: number;
    name: string;
    relation: number;
}

export interface SubscriptionAccount {
    accountId: number;
    accountReferenceId: number;
    active: boolean;
    activeFrom: string;
    balance: number;
    category: string;
    currencyId: number;
    expiryDate: string;
    initialBalance: number;
    name: string;
    reservedBalance: number;
    rollover: boolean;
    shared: boolean;
    type: string;
    unit: AccountUnit;
    unitId: number;
}