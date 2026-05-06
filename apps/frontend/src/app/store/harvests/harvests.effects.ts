import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of, switchMap } from 'rxjs';
import { HarvestActions } from './harvests.actions';
import { HarvestsService } from '../../core/services/harvests.service';

@Injectable()
export class HarvestsEffects {
  loadHarvests$ = createEffect(() =>
    this.actions$.pipe(
      ofType(HarvestActions.loadHarvests),
      switchMap(() =>
        this.harvestsService.getAll().pipe(
          map(harvests => HarvestActions.loadHarvestsSuccess({ harvests })),
          catchError(err => of(HarvestActions.loadHarvestsFailure({ error: err.message }))),
        ),
      ),
    ),
  );

  createHarvest$ = createEffect(() =>
    this.actions$.pipe(
      ofType(HarvestActions.createHarvest),
      mergeMap(({ dto }) =>
        this.harvestsService.create(dto).pipe(
          map(harvest => HarvestActions.createHarvestSuccess({ harvest })),
          catchError(err => of(HarvestActions.createHarvestFailure({ error: err.message }))),
        ),
      ),
    ),
  );

  tokenize$ = createEffect(() =>
    this.actions$.pipe(
      ofType(HarvestActions.tokenizeHarvest),
      mergeMap(({ id }) =>
        this.harvestsService.tokenize(id).pipe(
          map(harvest => HarvestActions.tokenizeHarvestSuccess({ harvest })),
          catchError(err => of(HarvestActions.tokenizeHarvestFailure({ error: err.message }))),
        ),
      ),
    ),
  );

  constructor(private actions$: Actions, private harvestsService: HarvestsService) {}
}
