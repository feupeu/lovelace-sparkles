import { ActionConfig } from 'custom-card-helpers'
import { object, optional, string, Infer, assign, any, boolean } from 'superstruct'
import { actionConfigStruct } from '../../structs/action-struct'
import { lovelaceCardStruct } from '../../structs/lovelace-card-struct'

export const cardConfigStruct = assign(
  lovelaceCardStruct,
  object({
    entity: string(),
    icon: string(),
    tap_action: any(),
    hold_action: any(),
    double_tap_action: any(),
    show_warning: optional(boolean()),
  })
)

export type CardConfig = Infer<typeof cardConfigStruct> & {
  tap_action: ActionConfig
  hold_action?: ActionConfig
  double_tap_action?: ActionConfig
}
