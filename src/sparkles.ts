import { version } from '../package.json'
import { PREFIX_NAME } from './const'

// ts-prune-ignore-next
export { TitleCard } from './cards/title-card/title-card'

console.info(`%c✨ ${PREFIX_NAME} ✨ - ${version}`, 'color: #abeabe; font-weight: 700;')
