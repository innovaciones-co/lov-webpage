import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ApiResponse } from '../models/api-response.model';
import { CustomerSubscriptionResponse } from '../models/customer.model';
import { SubscriptionService } from './subscription.service';

describe('SubscriptionService', () => {
    let service: SubscriptionService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [SubscriptionService]
        });
        service = TestBed.inject(SubscriptionService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getSubscriptionsByMsisdn', () => {
        it('should lookup the customer id and then retrieve subscription information', () => {
            const mockMsisdn = '573330701090';
            const mockCustomerId = 599113420;
            const customerLookupResponse: ApiResponse<{ id: number }> = {
                correlationId: 'rest-soa02-1767647482120-1',
                payload: {
                    id: mockCustomerId
                },
                providerId: 6,
                responseCode: 0,
                responseDetail: 'OK'
            };
            const mockResponse: ApiResponse<CustomerSubscriptionResponse> = {
                correlationId: 'rest-soa02-1767647482120-1',
                payload: {
                    additionalInformationPlaceHolder: {
                        additionalInformationString: null
                    },
                    address: {
                        city: 'Sabaneta',
                        country: 'CO',
                        line1: 'Calle 60sur 39 55',
                        state: 'Antioquia'
                    },
                    childCustomerIds: null,
                    consentToShareData: true,
                    contacts: {
                        portalAccount: 'sdtorresl'
                    },
                    customerType: 'RESIDENTIAL',
                    document: {
                        id: '1019054955',
                        type: 'ID'
                    },
                    email: 'chechotorres71@gmail.com',
                    emailVerified: false,
                    familyName: 'Torres',
                    givenName: 'Sergio',
                    id: mockCustomerId,
                    languageId: null,
                    lastModified: '2025-06-05T22:41:31.648+0000',
                    optedOutFromHouseholdDataShare: false,
                    parentCustomerId: null,
                    providerId: 6,
                    registrationChannel: 'CRM',
                    registrationDate: '2022-11-25T16:53:09.189+0000',
                    state: 'ACTIVE',
                    subscriptions: [{
                        activationDate: '2025-05-23T01:54:28.584+0000',
                        currentDevice: {},
                        customerId: '599113420',
                        iccid: '8957777200231030581',
                        id: 11552236471,
                        imsi: '732111231030581',
                        initialDevice: {},
                        isPhoneDirectoryRegistered: false,
                        msisdn: '573330701090',
                        paymentType: 'PREPAID',
                        phoneDirectoryRegistered: false,
                        providerId: 6,
                        state: 'ACTIVE',
                        tariff: {
                            tariffId: 106001,
                            tariffName: 'BASICA'
                        },
                        type: 'MOBILE'
                    }]
                },
                providerId: 6,
                responseCode: 0,
                responseDetail: 'OK'
            };

            service.getSubscriptionsByMsisdn(mockMsisdn).subscribe(response => {
                expect(response).toEqual(mockResponse);
            });

            const lookupReq = httpMock.expectOne(
                req => req.url === 'http://localhost:8000/api/subscriptions' &&
                    req.params.get('msisdn') === mockMsisdn
            );
            expect(lookupReq.request.method).toBe('GET');
            lookupReq.flush(customerLookupResponse);

            const customerReq = httpMock.expectOne(
                `http://localhost:8000/api/customers/${mockCustomerId}`
            );
            expect(customerReq.request.method).toBe('GET');
            customerReq.flush(mockResponse);
        });

        it('should handle customer lookup errors', () => {
            const mockMsisdn = '573330701090';
            const errorResponse = { status: 404, statusText: 'Not Found' };

            service.getSubscriptionsByMsisdn(mockMsisdn).subscribe({
                next: () => fail('Should have failed'),
                error: (error) => {
                    expect(error.status).toBe(404);
                }
            });

            const req = httpMock.expectOne(
                req => req.url === 'http://localhost:8000/api/subscriptions'
            );
            req.flush('Not Found', errorResponse);
        });

        it('should expose customer id lookup directly', () => {
            const mockMsisdn = '573330701090';
            const mockCustomerId = 599113420;

            service.getCustomerId({ msisdn: mockMsisdn }).subscribe(customerId => {
                expect(customerId).toEqual({ id: mockCustomerId });
            });

            const req = httpMock.expectOne(
                req => req.url === 'http://localhost:8000/api/subscriptions' &&
                    req.params.get('msisdn') === mockMsisdn
            );
            expect(req.request.method).toBe('GET');
            req.flush({
                correlationId: 'rest-soa02-1767647482120-1',
                payload: {
                    id: mockCustomerId
                },
                providerId: 6,
                responseCode: 0,
                responseDetail: 'OK'
            });
        });
    });
});