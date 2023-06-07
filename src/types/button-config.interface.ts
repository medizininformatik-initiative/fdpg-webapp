import type { TranslationSchema } from '@/plugins/i18n'
import type { ComputedRef } from 'vue'

export interface IButtonConfig {
  type: 'primary' | 'secondary' | 'danger' | 'success'
  label: TranslationSchema
  action: () => void
  isHidden?: boolean | ComputedRef<boolean>
  isDisabled?: boolean
  testId?: string
}
