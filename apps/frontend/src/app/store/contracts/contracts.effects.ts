import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of, switchMap } from 'rxjs';
import { ContractActions } from './contracts.actions';
import { ContractsService } from '../../core/services/contracts.service';

@Injectable()
export class ContractsEffects {
  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ContractActions.loadContracts),
      switchMap(() =>
        this.contractsService.getAll().pipe(
          map(contracts => ContractActions.loadContractsSuccess({ contracts })),
          catchError(err => of(ContractActions.loadContractsFailure({ error: err.message }))),
        ),
      ),
    ),
  );

  create$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ContractActions.createContract),
      mergeMap(({ dto }) =>
        this.contractsService.create(dto).pipe(
          map(contract => ContractActions.createContractSuccess({ contract })),
          catchError(err => of(ContractActions.createContractFailure({ error: err.message }))),
        ),
      ),
    ),
  );

  dispute$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ContractActions.disputeContract),
      mergeMap(({ id, reason }) =>
        this.contractsService.dispute(id, reason).pipe(
          map(contract => ContractActions.disputeContractSuccess({ contract })),
        ),
      ),
    ),
  );

  constructor(private actions$: Actions, private contractsService: ContractsService) {}
}
