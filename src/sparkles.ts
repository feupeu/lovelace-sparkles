import { PREFIX_NAME } from './const'

export { AreaCard } from './cards/area-card/area-card'
export { TitleCard } from './cards/title-card/title-card'
export { IndicatorElement } from './elements/indicator-element/indicator-element'

// @ts-ignore (VERSION is injected on build time)
console.info(`%c✨ ${PREFIX_NAME} ✨ version: ${VERSION}`, 'color: #abeabe; font-weight: 700;')
