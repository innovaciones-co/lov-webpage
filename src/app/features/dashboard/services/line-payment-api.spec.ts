import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DashboardService } from './dashboard.service';
import { PaymentService } from '../../payment-methods/services/payment-service';

describe('Line payment API', () => {
  let http: HttpTestingController;
  let dashboard: DashboardService;
  let cards: PaymentService;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
    dashboard = TestBed.inject(DashboardService);
    cards = TestBed.inject(PaymentService);
  });
  afterEach(() => http.verify());

  it('adds the selected line to card creation and default changes', () => {
    cards.createOnePayPaymentMethod({ cardToken: 'test-token', firstName: 'Test', lastName: 'User', email: 'test@example.com', phone: '3000000000', documentType: 'CC', documentNumber: 'test' }, 100).subscribe();
    http.expectOne(req => req.method === 'POST' && req.url.endsWith('/paymentMethods/onepay') && req.params.get('subscriberId') === '100').flush(1);
    cards.setDefaultPaymentMethod('1', 200).subscribe();
    http.expectOne(req => req.method === 'PUT' && req.url.endsWith('/paymentMethods/1/default') && req.params.get('subscriberId') === '200').flush(null);
  });

  it('reads and cancels a recharge on the selected line through the application backend', () => {
    let result: { autoTopup: unknown } | undefined;
    dashboard.getSavedRecharge('100').subscribe(value => result = value);
    http.expectOne(req => req.method === 'GET' && req.url.endsWith('/paymentMethods/schedule') && req.params.get('subscriberId') === '100')
      .flush({ amount: 30000, dayOfMonth: 12 });
    expect(result?.autoTopup).toEqual({ topupAmount: 3000000, schedule: { dayOfMonth: 12, frequency: 'Mensual' } });
    dashboard.deleteScheduledRecharge('200').subscribe();
    http.expectOne(req => req.method === 'DELETE' && req.url.endsWith('/paymentMethods/schedule') && req.params.get('subscriberId') === '200').flush(null);
  });

  it('represents a line without an automatic recharge as disabled', () => {
    let result: { autoTopup: unknown } | undefined;
    dashboard.getSavedRecharge('200').subscribe(value => result = value);
    http.expectOne(req => req.params.get('subscriberId') === '200').flush(null);
    expect(result?.autoTopup).toBeNull();
  });
});
