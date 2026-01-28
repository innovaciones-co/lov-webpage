import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { OrderResponse } from '../../models/order.model';
import { OrderStatusService } from '../../services/order-status.service';
import { PaymentService } from '../../services/payment.service';
import { PaymentResultComponent } from './payment-result';

describe('PaymentResultComponent', () => {
    let component: PaymentResultComponent;
    let fixture: ComponentFixture<PaymentResultComponent>;
    let mockRouter: jasmine.SpyObj<Router>;
    let mockActivatedRoute: jasmine.SpyObj<ActivatedRoute>;
    let mockOrderStatusService: jasmine.SpyObj<OrderStatusService>;
    let mockPaymentService: jasmine.SpyObj<PaymentService>;

    beforeEach(async () => {
        mockRouter = jasmine.createSpyObj('Router', ['navigate']);
        mockActivatedRoute = jasmine.createSpyObj('ActivatedRoute', [], {
            snapshot: {
                queryParams: {
                    referenceCode: 'TEST-REF-123'
                }
            }
        });
        mockOrderStatusService = jasmine.createSpyObj('OrderStatusService', [
            'checkOrderStatus',
            'shouldPollStatus',
            'stopPolling',
            'getStatusDisplayText',
            'getStatusColorClass',
            'isSuccessStatus',
            'isFailureStatus',
            'isProcessingStatus'
        ]);
        mockPaymentService = jasmine.createSpyObj('PaymentService', ['getOrderByReferenceCode']);

        await TestBed.configureTestingModule({
            imports: [PaymentResultComponent],
            providers: [
                { provide: Router, useValue: mockRouter },
                { provide: ActivatedRoute, useValue: mockActivatedRoute },
                { provide: OrderStatusService, useValue: mockOrderStatusService },
                { provide: PaymentService, useValue: mockPaymentService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(PaymentResultComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should process payment response on init', () => {
        const mockOrder: OrderResponse = {
            id: 'order-123',
            referenceCode: 'TEST-REF-123',
            status: 'COMPLETED',
            amount: 50000,
            description: 'Test Order',
            transactionId: 'tx-123',
            tax: 8000,
            taxReturnBase: 42000,
            currency: 'COP',
            signature: 'sig-123',
            details: { items: [] },
            subscriberId: 1,
            msisdn: '+573001234567',
            buyerPhone: '3001234567',
            buyerFullName: 'John Doe',
            buyerEmail: 'john@example.com',
            buyerDocumentType: 'CC',
            buyerDocument: '12345678',
            billingCountry: 'Colombia',
            billingCity: 'Bogotá',
            billingAddress: 'Calle 123'
        };

        mockOrderStatusService.checkOrderStatus.and.returnValue(of(mockOrder));
        mockOrderStatusService.shouldPollStatus.and.returnValue(false);

        component.ngOnInit();

        expect(mockOrderStatusService.checkOrderStatus).toHaveBeenCalledWith('TEST-REF-123');
        expect(component.order()).toEqual(mockOrder);
        expect(component.isLoading()).toBeFalse();
    });

    it('should handle missing reference code', () => {
        (mockActivatedRoute.snapshot as any).queryParams = {};

        component.ngOnInit();

        expect(component.error()).toContain('código de referencia');
        expect(component.isLoading()).toBeFalse();
    });

    it('should handle API error', () => {
        mockOrderStatusService.checkOrderStatus.and.returnValue(
            new Observable(observer => observer.error('API Error'))
        );

        component.ngOnInit();

        expect(component.error()).toContain('Error verificando el estado del pedido');
        expect(component.isLoading()).toBeFalse();
    });

    it('should start polling for processing status', () => {
        const mockOrder: OrderResponse = {
            id: 'order-123',
            referenceCode: 'TEST-REF-123',
            status: 'PAYMENT',
            amount: 50000,
            description: 'Test Order',
            transactionId: 'tx-123',
            tax: 8000,
            taxReturnBase: 42000,
            currency: 'COP',
            signature: 'sig-123',
            details: { items: [] },
            subscriberId: 1,
            msisdn: '+573001234567',
            buyerPhone: '3001234567',
            buyerFullName: 'John Doe',
            buyerEmail: 'john@example.com',
            buyerDocumentType: 'CC',
            buyerDocument: '12345678',
            billingCountry: 'Colombia',
            billingCity: 'Bogotá',
            billingAddress: 'Calle 123'
        };

        mockOrderStatusService.checkOrderStatus.and.returnValue(of(mockOrder));
        mockOrderStatusService.shouldPollStatus.and.returnValue(true);

        component.ngOnInit();

        expect(component.order()).toEqual(mockOrder);
        expect(component.isLoading()).toBeFalse();
    });

    it('should call router.navigate when onGoToDashboard is called', () => {
        component.onGoToDashboard();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should call router.navigate when onGoHome is called', () => {
        component.onGoHome();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    });
});