import type { TranslationSchema } from '@/plugins/i18n'

export interface IButtonConfig {
  type: 'primary' | 'secondary' | 'danger' | 'success'
  label: TranslationSchema
  action: () => void
  isHidden?: boolean
  isDisabled?: boolean
  testId?: string
}
