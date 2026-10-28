import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PaymentCardSelector } from './payment-card-selector';
import PaymentMethod from '../../models/payment-method.model';
import { PaymentService } from '../../services/payment.service';
import { CustomerSubscription } from '../../../../core/models/customer.model';

describe('PaymentCardSelector per line', () => {
  let fixture: ComponentFixture<PaymentCardSelector>;
  let http: HttpTestingController;
  const checkout = { paymentMethod: signal(PaymentMethod.CARD), setSelectedCreditCard: jasmine.createSpy() };
  const card = (id: number, defaultMethod = true) => ({ id, defaultMethod, issuer: 'VISA', truncatedNumber: '**** 1234', chargeable: true });
  const line = (id: number) => ({ id, customerId: '7', msisdn: `573001234${id}` } as CustomerSubscription);
  const render = () => { fixture.detectChanges(); TestBed.flushEffects(); };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PaymentCardSelector],
      providers: [provideHttpClient(), provideHttpClientTesting(), { provide: PaymentService, useValue: checkout }]
    }).overrideComponent(PaymentCardSelector, { set: { template: '' } });
    fixture = TestBed.createComponent(PaymentCardSelector);
    http = TestBed.inject(HttpTestingController);
    checkout.setSelectedCreditCard.calls.reset();
  });

  afterEach(() => { fixture.destroy(); http.verify(); });

  it('loads each line default and clears the previous selection', () => {
    fixture.componentRef.setInput('currentSubscription', line(100)); render();
    http.expectOne(req => req.url.endsWith('/paymentMethods') && req.params.get('subscriberId') === '100').flush([card(1)]);
    render();
    expect(fixture.componentInstance.paymentCardControl.value).toBe('1');
    fixture.componentRef.setInput('currentSubscription', line(200)); render();
    expect(fixture.componentInstance.creditCards()).toEqual([]);
    expect(fixture.componentInstance.paymentCardControl.value).toBeNull();
    expect(checkout.setSelectedCreditCard).toHaveBeenCalledWith(undefined);
    http.expectOne(req => req.url.endsWith('/paymentMethods') && req.params.get('subscriberId') === '200').flush([card(2)]);
    render();
    expect(fixture.componentInstance.paymentCardControl.value).toBe('2');
  });

  it('cancels obsolete requests when changing line', () => {
    fixture.componentRef.setInput('currentSubscription', line(100)); render();
    const old = http.expectOne(req => req.params.get('subscriberId') === '100');
    fixture.componentRef.setInput('currentSubscription', line(200)); render();
    expect(old.cancelled).toBeTrue();
    http.expectOne(req => req.params.get('subscriberId') === '200').flush([card(2)]);
    render();
    expect(fixture.componentInstance.creditCards().map(item => item.id)).toEqual([2]);
  });

  it('saves a line default without changing the screen after switching lines', () => {
    fixture.componentRef.setInput('currentSubscription', line(100)); render();
    http.expectOne(req => req.params.get('subscriberId') === '100').flush([card(1)]);
    fixture.componentInstance.onSetDefault('1');
    const save = http.expectOne(req => req.method === 'PUT' && req.url.endsWith('/1/default') && req.params.get('subscriberId') === '100');
    fixture.componentRef.setInput('currentSubscription', line(200)); render();
    http.expectOne(req => req.method === 'GET' && req.params.get('subscriberId') === '200').flush([card(2)]);
    save.flush(null);
    render();
    expect(fixture.componentInstance.creditCards().map(item => [item.id, item.defaultMethod])).toEqual([[2, true]]);
  });
});
