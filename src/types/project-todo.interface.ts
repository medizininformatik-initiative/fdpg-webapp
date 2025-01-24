import type { TranslationSchema } from '@/plugins/i18n'
import type { IConditionalApproval } from './proposal.types'

export interface IProjectTodo {
  date?: string
  title: string
  description: string
  action: (...args) => void
  actionLabel?: TranslationSchema
  type: 'comment' | 'decision' | 'info' | 'condition-check'
  icon?: string
  isDone?: boolean
  testId?: string
  condition?: IConditionalApproval
}
