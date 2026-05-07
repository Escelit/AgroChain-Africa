import { TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';
import { HarvestsEffects } from './harvests.effects';
import { HarvestActions } from './harvests.actions';
import { HarvestsService } from '../../core/services/harvests.service';

describe('HarvestsEffects', () => {
  let actions$: Observable<any>;
  let effects: HarvestsEffects;
  let harvestsService: jasmine.SpyObj<HarvestsService>;

  beforeEach(() => {
    harvestsService = jasmine.createSpyObj('HarvestsService', ['getAll', 'create', 'tokenize', 'getOne']);

    TestBed.configureTestingModule({
      providers: [
        HarvestsEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        { provide: HarvestsService, useValue: harvestsService },
      ],
    });

    effects = TestBed.inject(HarvestsEffects);
  });

  it('loadHarvests$ should dispatch success on API response', (done) => {
    const harvests = [{ id: '1', commodity: 'MAIZE' }] as any;
    harvestsService.getAll.and.returnValue(of(harvests));
    actions$ = of(HarvestActions.loadHarvests());

    effects.loadHarvests$.subscribe(action => {
      expect(action).toEqual(HarvestActions.loadHarvestsSuccess({ harvests }));
      done();
    });
  });

  it('loadHarvests$ should dispatch failure on error', (done) => {
    harvestsService.getAll.and.returnValue(throwError(() => new Error('Network error')));
    actions$ = of(HarvestActions.loadHarvests());

    effects.loadHarvests$.subscribe(action => {
      expect(action).toEqual(HarvestActions.loadHarvestsFailure({ error: 'Network error' }));
      done();
    });
  });

  it('tokenize$ should dispatch success', (done) => {
    const harvest = { id: '1', status: 'TOKENIZED', stellarBatchId: 'batch-1' } as any;
    harvestsService.tokenize.and.returnValue(of(harvest));
    actions$ = of(HarvestActions.tokenizeHarvest({ id: '1' }));

    effects.tokenize$.subscribe(action => {
      expect(action).toEqual(HarvestActions.tokenizeHarvestSuccess({ harvest }));
      done();
    });
  });
});
