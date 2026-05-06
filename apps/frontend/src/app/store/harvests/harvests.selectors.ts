import { createFeatureSelector, createSelector } from '@ngrx/store';
import { HarvestsState } from './harvests.reducer';

const selectHarvestsState = createFeatureSelector<HarvestsState>('harvests');

export const selectAllHarvests = createSelector(selectHarvestsState, s => s.items);
export const selectHarvestsLoading = createSelector(selectHarvestsState, s => s.loading);
export const selectHarvestsError = createSelector(selectHarvestsState, s => s.error);
export const selectTokenizedHarvests = createSelector(selectAllHarvests, items =>
  items.filter(h => h.status === 'TOKENIZED' || h.status === 'LISTED'),
);
