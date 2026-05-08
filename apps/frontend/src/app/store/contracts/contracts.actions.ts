import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { EscrowContract, CreateContractDto } from '../../core/services/contracts.service';

export const ContractActions = createActionGroup({
  source: 'Contracts',
  events: {
    'Load Contracts': emptyProps(),
    'Load Contracts Success': props<{ contracts: EscrowContract[] }>(),
    'Load Contracts Failure': props<{ error: string }>(),
    'Create Contract': props<{ dto: CreateContractDto }>(),
    'Create Contract Success': props<{ contract: EscrowContract }>(),
    'Create Contract Failure': props<{ error: string }>(),
    'Dispute Contract': props<{ id: string; reason: string }>(),
    'Dispute Contract Success': props<{ contract: EscrowContract }>(),
  },
});
