import type { TranslationSchema } from '@/plugins/i18n'

export interface IButtonConfig {
  type?: 'primary' | 'danger' | 'success'
  label: TranslationSchema
  action: () => void
  isHidden?: boolean
  isDisabled?: boolean
  isLoading?: boolean
  testId?: string
}
