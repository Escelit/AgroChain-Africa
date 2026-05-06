import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Harvest, CreateHarvestDto } from '../../core/services/harvests.service';

export const HarvestActions = createActionGroup({
  source: 'Harvests',
  events: {
    'Load Harvests': emptyProps(),
    'Load Harvests Success': props<{ harvests: Harvest[] }>(),
    'Load Harvests Failure': props<{ error: string }>(),
    'Create Harvest': props<{ dto: CreateHarvestDto }>(),
    'Create Harvest Success': props<{ harvest: Harvest }>(),
    'Create Harvest Failure': props<{ error: string }>(),
    'Tokenize Harvest': props<{ id: string }>(),
    'Tokenize Harvest Success': props<{ harvest: Harvest }>(),
    'Tokenize Harvest Failure': props<{ error: string }>(),
  },
});
