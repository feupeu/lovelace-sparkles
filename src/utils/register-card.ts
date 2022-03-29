import { assert, Infer, object, string } from 'superstruct'

const paramsStruct = object({
  type: string(),
  name: string(),
  description: string(),
})

export function registerCard(params: Infer<typeof paramsStruct>) {
  assert(params, paramsStruct)

  const windowWithCards = window as unknown as Window & {
    customCards: unknown[]
  }

  windowWithCards.customCards = windowWithCards.customCards ?? []
  windowWithCards.customCards.push({
    ...params,
    preview: true,
  })
}
