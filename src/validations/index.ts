import { i18n } from '@/plugins/i18n'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import type { IUpload } from '@/types/proposal.types'
import type { Ref } from 'vue'

const proposalStore = useProposalStore()
const { t } = i18n.global

export const requiredValidationFunc = (
  type: 'array' | 'string' | 'number' | 'date' | 'boolean' | 'any' = 'any',
  required: boolean = true,
) => ({
  type,
  required,
  trigger: ['blur', 'change'],
  message: t('general.requiredField'),
})

export const maxLengthValidationFunc = (length: number) => ({
  max: length,
  trigger: ['blur', 'change'],
  message: t('general.maxCharLimit', { length }),
})

export const numberValidationFunc = () => ({
  type: 'number',
  trigger: ['blur', 'change'],
  message: t('general.invalidField'),
})

export const emailValidationFunc = () => ({
  type: 'email',
  trigger: ['blur', 'change'],
  message: t('general.invalidField'),
})

export const specialCharactersValidationFunc = () => ({
  validator: (_rule, value: string, callback) => {
    const valid: boolean = /^[\u00C0-\u017Fa-zA-Z0-9&/\\?.:#*+-_|@ ]+$/.test(value) && value.indexOf('  ') === -1
    if (!valid) {
      callback(new Error(t('general.invalidField')))
    } else {
      callback()
    }
  },
  trigger: ['blur', 'change'],
})

export const checkValueShouldBeTrue = () => ({
  validator: (_rule, value: boolean | undefined, callback) => {
    if (!value) {
      callback(new Error(t('general.requiredField')))
    } else {
      callback()
    }
  },
  trigger: ['blur', 'change'],
})

export const requiredIfEmptyValidationFunc = (
  otherField: Ref<number | string | boolean | undefined | Object | Array<number | string>>,
) => ({
  validator: (_rule, value, callback) => {
    const isNotExisting = (value) => {
      const isEmptyArray = Array.isArray(value) && value.length <= 0
      const isUndefined = value == undefined
      const isEmptyString = typeof value === 'string' && value.trim() === ''
      const isEmptyObject = typeof value === 'object' && Object.keys(value).length <= 0
      return isEmptyArray || isUndefined || isEmptyString || isEmptyObject
    }
    if (isNotExisting(value) && isNotExisting(otherField.value)) {
      callback(new Error(t('general.oneFieldRequired')))
    } else {
      callback()
    }
  },
  trigger: ['blur', 'change'],
})

export const projectAbbreviationValidationFunc = (
  proposalId: Ref<string | undefined>,
  bypassDebounce: Ref<boolean>,
) => {
  const debounceTime = 1500
  let debounceTimeout: number | undefined = undefined
  return {
    asyncValidator: async (_rule, value: string, callback) => {
      return new Promise(function () {
        if (debounceTimeout !== undefined) {
          window.clearTimeout(debounceTimeout)
          debounceTimeout = undefined
        }

        debounceTimeout = window.setTimeout(
          async () => {
            const isUnique = await proposalStore.checkUnique(value, proposalId.value)

            if (isUnique === true) {
              callback()
            } else {
              callback(new Error(t('proposal.thereIsAlreadyExistingProposalWithTheName')))
            }
          },
          bypassDebounce.value ? 0 : debounceTime,
        )
      })
    },
    trigger: ['blur', 'change'],
  }
}

export const requiredUploadFunc = (uploads: Ref<IUpload[] | undefined>) => {
  return {
    validator: (_rule, value: string, callback) => {
      if (!uploads.value?.length) {
        callback(new Error(t('general.requiredField')))
      } else {
        callback()
      }
    },
    trigger: ['blur', 'change'],
  }
}

export const startDateInPastValidationFunc = () => {
  return {
    validator: (_rule, value: string, callback) => {
      const selectedDate = new Date(value)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (selectedDate < today) {
        callback(new Error(t('general.startDateInPast')))
      } else {
        callback()
      }
    },
    trigger: ['blur', 'change'],
  }
}
