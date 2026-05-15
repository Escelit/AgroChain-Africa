import { harvestsReducer, HarvestsState } from './harvests.reducer';
import { HarvestActions } from './harvests.actions';

const initialState: HarvestsState = { items: [], loading: false, error: null };

describe('harvestsReducer', () => {
  it('should return initial state', () => {
    expect(harvestsReducer(undefined, { type: '@@INIT' } as any)).toEqual(initialState);
  });

  it('should set loading on loadHarvests', () => {
    const state = harvestsReducer(initialState, HarvestActions.loadHarvests());
    expect(state.loading).toBe(true);
  });

  it('should populate items on loadHarvestsSuccess', () => {
    const harvests = [{ id: '1', commodity: 'MAIZE' }] as any;
    const state = harvestsReducer(initialState, HarvestActions.loadHarvestsSuccess({ harvests }));
    expect(state.items).toEqual(harvests);
    expect(state.loading).toBe(false);
  });

  it('should set error on loadHarvestsFailure', () => {
    const state = harvestsReducer(initialState, HarvestActions.loadHarvestsFailure({ error: 'Network error' }));
    expect(state.error).toBe('Network error');
    expect(state.loading).toBe(false);
  });

  it('should prepend new harvest on createHarvestSuccess', () => {
    const existing = { items: [{ id: '1' }] as any, loading: false, error: null };
    const harvest = { id: '2', commodity: 'COFFEE' } as any;
    const state = harvestsReducer(existing, HarvestActions.createHarvestSuccess({ harvest }));
    expect(state.items[0].id).toBe('2');
    expect(state.items).toHaveLength(2);
  });

  it('should update harvest on tokenizeHarvestSuccess', () => {
    const existing = { items: [{ id: '1', status: 'DRAFT' }] as any, loading: false, error: null };
    const harvest = { id: '1', status: 'TOKENIZED', stellarBatchId: 'batch-1' } as any;
    const state = harvestsReducer(existing, HarvestActions.tokenizeHarvestSuccess({ harvest }));
    expect(state.items[0].status).toBe('TOKENIZED');
  });
});
