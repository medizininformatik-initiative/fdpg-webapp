import type { TranslationSchema } from '@/plugins/i18n'
import type { ProjectStatusType } from './proposal.types'

export interface IProjectStatus {
  type: ProjectStatusType
  description: TranslationSchema
  descriptionI18nParameter?: Record<string, string | number>
}
