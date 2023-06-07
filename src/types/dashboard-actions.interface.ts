import type { TranslationSchema } from '@/plugins/i18n'

export interface IDashboardAction {
  descriptionText: TranslationSchema
  actionText: TranslationSchema
  style: 'blue' | 'green'
  action: () => any
  testId?: string
}
