import { PlatformIdentifier } from '@/types/platform-identifier.enum'
import type { ITermsConfigGet } from '@/types/terms.types'

export const mockTermsAndConditions: ITermsConfigGet = {
  _id: 'abc',
  createdAt: '2022-08-30T09:36:04.299Z',
  updatedAt: '2022-08-30T09:36:04.299Z',
  platform: PlatformIdentifier.Mii,
  messages: {
    en: {
      translationValue: 'English {slot}',
      slotValue: 'hello',
    },
    de: {
      translationValue: 'German {slot}',
      slotValue: 'hallo',
    },
  },
  terms: [
    {
      label: 'translationValue',
      slots: [
        {
          label: 'slotValue',
          name: 'slot',
          link: 'https://forschen-fuer-gesundheit.de/',
        },
      ],
    },
  ],
}
