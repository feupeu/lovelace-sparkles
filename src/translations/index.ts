import { HomeAssistant } from 'custom-card-helpers'
import * as en from './en.json'

const languages = {
  en,
}

const DEFAULT_LANG = 'en'

function getTranslatedString(key: string, lang: string): string | undefined {
  try {
    return key.split('.').reduce((o, i) => (o as Record<string, unknown>)[i], languages[lang]) as string
  } catch (_) {
    return undefined
  }
}

export const setupLocalize = (hass?: HomeAssistant) => (key: string) => {
  const lang = hass?.locale.language ?? DEFAULT_LANG
  return getTranslatedString(key, lang) ?? getTranslatedString(key, DEFAULT_LANG) ?? key
}
