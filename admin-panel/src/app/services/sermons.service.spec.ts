import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { SermonsService } from './sermons.service';

describe('SermonsService', () => {
  let service: SermonsService;
  let httpMock: HttpTestingController
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        SermonsService
      ]
    });
    service = TestBed.inject(SermonsService);
    httpMock = TestBed.inject(HttpTestingController);

  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have 6 sermons in the JSON file', () => {
  service.getSermons().subscribe((sermons) => {
    expect(sermons.length).toBe(6);
  });

  const req = httpMock.expectOne('assets/sermons.json');

});
});
