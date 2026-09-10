import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { SubscriptionAccount } from '../models/account.model';
import { SubscriptionFacadeService } from './subscription-facade.service';
import { SubscriptionService } from './subscription.service';

describe('SubscriptionFacadeService', () => {
    let facade: SubscriptionFacadeService;
    let subscriptionService: jasmine.SpyObj<SubscriptionService>;

    const createAccount = (expiryDate: string): SubscriptionAccount => ({
        accountId: 1,
        accountReferenceId: 2,
        active: true,
        activeFrom: '2026-01-01T00:00:00.000Z',
        balance: 100,
        category: 'DATA',
        currencyId: 1,
        expiryDate,
        initialBalance: 100,
        name: 'Data account',
        reservedBalance: 0,
        rollover: false,
        shared: false,
        type: 'DATA',
        unit: {
            currencyId: 1,
            id: 1,
            mantissa: 1,
            name: 'MB',
            relation: 1
        },
        unitId: 1
    });

    beforeEach(() => {
        subscriptionService = jasmine.createSpyObj<SubscriptionService>('SubscriptionService', ['getAccounts']);

        TestBed.configureTestingModule({
            providers: [
                SubscriptionFacadeService,
                { provide: SubscriptionService, useValue: subscriptionService }
            ]
        });

        facade = TestBed.inject(SubscriptionFacadeService);
    });

    it('should return non-expired accounts and pass customer and subscription IDs', () => {
        const activeAccount = createAccount('2099-01-01T00:00:00.000Z');
        const expiredAccount = createAccount('2000-01-01T00:00:00.000Z');
        subscriptionService.getAccounts.and.returnValue(of({
            correlationId: 'correlation-id',
            payload: [activeAccount, expiredAccount],
            providerId: 1,
            responseCode: 0,
            responseDetail: 'OK'
        }));

        facade.getAccountsForSubscription('customer-1', 'subscription-1').subscribe(accounts => {
            expect(accounts).toEqual([activeAccount]);
        });

        expect(subscriptionService.getAccounts).toHaveBeenCalledOnceWith('customer-1', 'subscription-1');
    });

    it('should return an empty array when retrieving accounts fails', () => {
        subscriptionService.getAccounts.and.returnValue(throwError(() => new Error('Request failed')));

        facade.getAccountsForSubscription('customer-1', 'subscription-1').subscribe(accounts => {
            expect(accounts).toEqual([]);
        });
    });
});
