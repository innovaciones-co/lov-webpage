import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { Paginator } from '../../../core/models/paginator.model';
import { HistoryItem } from '../models/history.model';
import { HistoryService } from './history.service';

describe('HistoryService', () => {
  let service: HistoryService;
  let httpTestingController: HttpTestingController;

  const mockHistoryResponse: Paginator<HistoryItem> = {
    content: [
      {
        date: '2026-06-11T23:10:17Z',
        type: 'DATA',
        detail: 'Navegacion movil',
        amount: 0.01,
        measure: 'MB'
      }
    ],
    page: {
      size: 100,
      number: 1,
      totalElements: 200,
      totalPages: 2
    }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(HistoryService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch history by subscriber id and update signals', () => {
    let responseBody: Paginator<HistoryItem> | undefined;

    service.getHistory(16112018597).subscribe((response) => {
      responseBody = response;
    });

    expect(service.getLoadingSignal()()).toBeTrue();
    expect(service.getErrorSignal()()).toBeNull();

    const request = httpTestingController.expectOne((req) => {
      return req.method === 'GET'
        && req.url.endsWith('/history/16112018597')
        && req.params.get('size') === '100'
        && req.params.get('page') === '0'
        && req.params.get('subscriberId') === '16112018597';
    });

    expect(request.request.method).toBe('GET');
    expect(request.request.headers.get('accept')).toBeNull();

    request.flush(mockHistoryResponse);

    expect(responseBody).toEqual(mockHistoryResponse);
    expect(service.getHistorySignal()()).toEqual(mockHistoryResponse);
    expect(service.getLoadingSignal()()).toBeFalse();
  });

  it('should expose request errors through the error signal', () => {
    let capturedError: Error | undefined;

    service.getHistory(16112018597).subscribe({
      error: (error) => {
        capturedError = error;
      }
    });

    const request = httpTestingController.expectOne((req) => {
      return req.method === 'GET'
        && req.url.endsWith('/history/16112018597')
        && req.params.get('size') === '100'
        && req.params.get('page') === '0'
        && req.params.get('subscriberId') === '16112018597';
    });

    request.flush({ message: 'Boom' }, { status: 500, statusText: 'Server Error' });

    expect(capturedError).toBeTruthy();
    expect(service.getErrorSignal()).toBeTruthy();
    expect(service.getErrorSignal()()).toContain('Http failure response');
    expect(service.getLoadingSignal()()).toBeFalse();
  });
});
