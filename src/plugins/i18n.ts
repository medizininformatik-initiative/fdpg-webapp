import { createI18n } from 'vue-i18n'
import { en, de } from '../locales'
import type { NestedPath } from '@/types/nested-key-of.type'

export type MessageSchema = typeof en
export type TranslationSchema = NestedPath<MessageSchema>
export type SupportedLanguages = 'en' | 'de'

const locale = (() => {
  let language = localStorage.getItem('translationLocale')
  if (!language) {
    language = navigator.language.split('-')[0]
    localStorage.setItem('translationLocale', language)
  }
  return language
})()

export const i18n = createI18n<[MessageSchema], SupportedLanguages>({
  locale: locale,
  legacy: false,
  fallbackLocale: ['de'],
  globalInjection: true,
  messages: {
    en,
    de,
  },
})
