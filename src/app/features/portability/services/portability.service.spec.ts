import { TestBed } from '@angular/core/testing';

import { Portability } from './portability';

describe('Portability', () => {
  let service: Portability;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Portability);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
