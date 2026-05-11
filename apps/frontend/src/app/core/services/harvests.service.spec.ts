import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HarvestsService } from './harvests.service';
import { environment } from '../../../environments/environment';

describe('HarvestsService', () => {
  let service: HarvestsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HarvestsService],
    });
    service = TestBed.inject(HarvestsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should fetch all harvests', () => {
    const mockHarvests = [{ id: '1', commodity: 'MAIZE', status: 'TOKENIZED' }];
    service.getAll().subscribe(h => expect(h).toEqual(mockHarvests));
    const req = httpMock.expectOne(`${environment.apiUrl}/harvests`);
    expect(req.request.method).toBe('GET');
    req.flush(mockHarvests);
  });

  it('should create a harvest', () => {
    const dto = { commodity: 'COFFEE', grade: 'AA', weightKg: 200, locationGeohash: 'abc', harvestDate: '2026-12-01' };
    const mockResponse = { id: '2', ...dto, status: 'DRAFT' };
    service.create(dto as any).subscribe(h => expect(h.status).toBe('DRAFT'));
    const req = httpMock.expectOne(`${environment.apiUrl}/harvests`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should tokenize a harvest', () => {
    const mockResponse = { id: '1', status: 'TOKENIZED', stellarBatchId: 'batch-123' };
    service.tokenize('1').subscribe(h => expect(h.stellarBatchId).toBe('batch-123'));
    const req = httpMock.expectOne(`${environment.apiUrl}/harvests/1/tokenize`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });
});
