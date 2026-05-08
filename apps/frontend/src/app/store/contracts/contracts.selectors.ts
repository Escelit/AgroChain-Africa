import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ContractsState } from './contracts.reducer';

const selectState = createFeatureSelector<ContractsState>('contracts');

export const selectAllContracts = createSelector(selectState, s => s.items);
export const selectContractsLoading = createSelector(selectState, s => s.loading);
export const selectActiveContracts = createSelector(selectAllContracts,
  items => items.filter(c => c.status === 'FUNDED'));
export const selectDisputedContracts = createSelector(selectAllContracts,
  items => items.filter(c => c.status === 'DISPUTED'));
