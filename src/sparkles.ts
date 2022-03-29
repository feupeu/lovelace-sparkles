import { PREFIX_NAME } from './const'

// ts-prune-ignore-next
export { TitleCard } from './cards/title-card/title-card'

// @ts-ignore (VERSION is injected on build time)
console.info(`%c✨ ${PREFIX_NAME} ✨ version: ${VERSION}`, 'color: #abeabe; font-weight: 700;')
