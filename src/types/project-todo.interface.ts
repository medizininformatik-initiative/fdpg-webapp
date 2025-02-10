import type { TranslationSchema } from '@/plugins/i18n'
import type { IConditionalApproval, IEditAdditionalLocationProposalInformation } from './proposal.types'

export interface IProjectTodo {
  date?: string
  title: string
  description: string
  action: (...args: any) => void
  actionLabel?: TranslationSchema
  type: 'comment' | 'decision' | 'info' | 'condition-check' | 'additional-location-information'
  icon?: string
  isDone?: boolean
  testId?: string
  condition?: IConditionalApproval
  additionalInformation?: IEditAdditionalLocationProposalInformation
  readonly: boolean
}
