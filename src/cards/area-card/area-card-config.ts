import { ActionConfig } from 'custom-card-helpers'
import { object, optional, string, Infer, assign, any, boolean, array } from 'superstruct'
import { actionConfigStruct } from '../../structs/action-struct'
import { lovelaceCardStruct } from '../../structs/lovelace-card-struct'

const indicator = object({
  icon: string(),
  primary: string(),
  secondary: string(),
  color: string(),
})

export const cardConfigStruct = assign(
  lovelaceCardStruct,
  object({
    entity: string(),
    layout: string(),
    icon: string(),
    indicators: array(indicator),
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
