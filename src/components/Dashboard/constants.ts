import type { TranslationSchema } from '@/plugins/i18n'
import type { SortableFields } from '@/types/proposal.types'

export const sortOptions: { label: TranslationSchema; value: SortableFields }[] = [
  {
    label: 'dashboard.application',
    value: 'submittedAt',
  },
  {
    label: 'dashboard.projectAbbreviations',
    value: 'projectAbbreviation',
  },
  {
    label: 'general.applicant',
    value: 'ownerName',
  },
  {
    label: 'dashboard.dueDate',
    value: 'dueDateForStatus',
  },
]
