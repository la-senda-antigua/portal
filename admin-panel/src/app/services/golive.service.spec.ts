import { TestBed } from '@angular/core/testing';

import { GoliveService } from './golive.service';

describe('GoliveService', () => {
  let service: GoliveService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GoliveService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
