import { any, object, string } from 'superstruct'

export const lovelaceCardStruct = object({
  type: string(),
  view_layout: any(),
})
