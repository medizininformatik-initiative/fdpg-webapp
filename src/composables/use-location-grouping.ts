import { SORTED_ACTIVE_LOCATION_OPTIONS } from '@/constants'
import type { TranslationSchema} from '@/plugins/i18n';
import { i18n } from '@/plugins/i18n'
import { MiiLocation } from '@/types/location.enum'

interface GroupOption {
  label?: string
  options: Option[]
}

interface Option {
  label: string
  value: string
}

const { t } = i18n.global

export default (allGroupLabel?: TranslationSchema, allOptionLabel?: TranslationSchema) => {
  const virtualAllOption = {
    label: t(allOptionLabel || 'proposal.commentVisibleForAll'),
    value: MiiLocation.VirtualAll,
  }
  const groupOptions: GroupOption[] = [
    {
      label: allGroupLabel ? t(allGroupLabel) : undefined,
      options: [virtualAllOption],
    },
    {
      label: t('general.locations'),
      options: SORTED_ACTIVE_LOCATION_OPTIONS,
    },
  ]
  return {
    groupOptions,
  }
}
