import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { Customer, CustomerSubscription } from '../../core/models/customer.model';
import { LineAliasService } from '../../core/services/line-alias.service';
import { SubscriptionFacadeService } from '../../core/services/subscription-facade.service';
import { User } from '../authentication/models/auth.models';
import { AuthService } from '../authentication/services/auth.service';
import { Dashboard } from './dashboard';

describe('Dashboard account lines', () => {
  const user = (customerId: number): User => ({ customerId, firstName: 'Test', lastName: 'User', email: 'test@example.com' });
  const lines = [
    { id: 1, customerId: '42', msisdn: '573001111111', state: 'SUSPENDED' },
    { id: 2, customerId: '42', msisdn: '573002222222', state: 'ACTIVE' },
    { id: 3, customerId: '42', msisdn: '573003333333', state: 'INACTIVE' }
  ] as CustomerSubscription[];
  const customer = (id = 42) => ({
    id, givenName: 'Test', familyName: 'User', email: 'test@example.com',
    document: { type: 'CC', id: 'test' }, address: {},
    additionalInformationPlaceHolder: { additionalInformationString: '' }, subscriptions: lines
  } as Customer);
  let users: BehaviorSubject<User | null>;
  let facade: jasmine.SpyObj<SubscriptionFacadeService>;
  let auth: { user$: BehaviorSubject<User | null>; getStoredMsisdn: jasmine.Spy };

  beforeEach(() => {
    users = new BehaviorSubject<User | null>(user(42));
    auth = { user$: users, getStoredMsisdn: jasmine.createSpy().and.returnValue(of('stale-other-line')) };
    facade = jasmine.createSpyObj('SubscriptionFacadeService', ['getCustomerWithSubscriptionsByCustomerId', 'getAccountsForSubscription']);
    facade.getCustomerWithSubscriptionsByCustomerId.and.returnValue(of({ payload: customer() } as any));
    facade.getAccountsForSubscription.and.returnValue(of([]));
    TestBed.configureTestingModule({
      imports: [Dashboard], providers: [
        { provide: AuthService, useValue: auth },
        { provide: SubscriptionFacadeService, useValue: facade },
        { provide: LineAliasService, useValue: { load() {}, viewingLineId: null, setViewingLine() {} } }
      ]
    }).overrideComponent(Dashboard, { set: { template: '', imports: [] } });
  });

  it('loads all account lines by authenticated customer and keeps their states', () => {
    const fixture = TestBed.createComponent(Dashboard);
    fixture.detectChanges();
    expect(facade.getCustomerWithSubscriptionsByCustomerId).toHaveBeenCalledOnceWith(42);
    expect(auth.getStoredMsisdn).not.toHaveBeenCalled();
    expect(fixture.componentInstance.activeSubscriptions()).toEqual(lines);
    expect(fixture.componentInstance.currentSubscription()?.id).toBe(2);
  });

  it('clears the list when there is no authenticated customer', () => {
    const fixture = TestBed.createComponent(Dashboard);
    fixture.detectChanges();
    users.next(null);
    expect(fixture.componentInstance.activeSubscriptions()).toEqual([]);
    expect(fixture.componentInstance.currentSubscription()).toBeNull();
    expect(fixture.componentInstance.linesLoading()).toBeFalse();
  });

  it('ignores a late response from a previous signed-in customer', () => {
    const previous = new Subject<any>();
    facade.getCustomerWithSubscriptionsByCustomerId.and.callFake(id => id === 42 ? previous : of({ payload: { ...customer(84), subscriptions: [] } } as any));
    const fixture = TestBed.createComponent(Dashboard);
    fixture.detectChanges();
    users.next(user(84));
    previous.next({ payload: customer() });
    expect(fixture.componentInstance.activeSubscriptions()).toEqual([]);
    expect(fixture.componentInstance.currentSubscription()).toBeNull();
  });
});
