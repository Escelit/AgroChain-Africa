import { createReducer, on } from '@ngrx/store';
import { EscrowContract } from '../../core/services/contracts.service';
import { ContractActions } from './contracts.actions';

export interface ContractsState {
  items: EscrowContract[];
  loading: boolean;
  error: string | null;
}

const initialState: ContractsState = { items: [], loading: false, error: null };

export const contractsReducer = createReducer(
  initialState,
  on(ContractActions.loadContracts, state => ({ ...state, loading: true, error: null })),
  on(ContractActions.loadContractsSuccess, (state, { contracts }) => ({
    ...state, items: contracts, loading: false,
  })),
  on(ContractActions.loadContractsFailure, (state, { error }) => ({
    ...state, loading: false, error,
  })),
  on(ContractActions.createContractSuccess, (state, { contract }) => ({
    ...state, items: [contract, ...state.items],
  })),
  on(ContractActions.disputeContractSuccess, (state, { contract }) => ({
    ...state, items: state.items.map(c => c.id === contract.id ? contract : c),
  })),
);
