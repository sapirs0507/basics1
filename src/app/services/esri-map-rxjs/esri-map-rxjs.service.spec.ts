import { TestBed } from '@angular/core/testing';

import { EsriMapRxjsService } from './esri-map-rxjs.service';

describe('EsriMapRxjsService', () => {
  let service: EsriMapRxjsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EsriMapRxjsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
