import { createReducer, on } from '@ngrx/store';
import { Harvest } from '../../core/services/harvests.service';
import { HarvestActions } from './harvests.actions';

export interface HarvestsState {
  items: Harvest[];
  loading: boolean;
  error: string | null;
}

const initialState: HarvestsState = {
  items: [],
  loading: false,
  error: null,
};

export const harvestsReducer = createReducer(
  initialState,
  on(HarvestActions.loadHarvests, state => ({ ...state, loading: true, error: null })),
  on(HarvestActions.loadHarvestsSuccess, (state, { harvests }) => ({
    ...state,
    items: harvests,
    loading: false,
  })),
  on(HarvestActions.loadHarvestsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  on(HarvestActions.createHarvestSuccess, (state, { harvest }) => ({
    ...state,
    items: [harvest, ...state.items],
  })),
  on(HarvestActions.tokenizeHarvestSuccess, (state, { harvest }) => ({
    ...state,
    items: state.items.map(h => (h.id === harvest.id ? harvest : h)),
  })),
);
