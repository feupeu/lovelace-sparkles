import { object, optional, string, Infer, assign } from 'superstruct'
import { lovelaceCardStruct } from '../../structs/lovelace-card-struct'

export const titleCardConfigStruct = assign(
  lovelaceCardStruct,
  object({
    title: optional(string()),
    subtitle: optional(string()),
  })
)
export type TitleCardConfig = Infer<typeof titleCardConfigStruct>
