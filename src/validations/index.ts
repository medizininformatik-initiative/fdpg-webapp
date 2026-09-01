import { i18n } from '@/plugins/i18n'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import type { IUpload } from '@/types/proposal.types'
import { AsyncValidationState } from '@/types/component.types'
import type { Ref } from 'vue'
import type { FormRules } from 'element-plus'

const { t } = i18n.global

// Mirrors fdpg-api's PROPOSAL_SHORTCUT_REGEX (src/shared/constants/regex.constants.ts) exactly -
// keep both in sync. Without this, a value the backend's @Matches(PROPOSAL_SHORTCUT_REGEX) would
// reject (e.g. leading/trailing whitespace) could still pass the uniqueness check here and show
// as valid, only to fail once the proposal is actually saved.
const PROJECT_ABBREVIATION_ALLOWED_CHARS = `[\\wÀ-ž&\\\\#/*?.:+\\-|@]`
const PROJECT_ABBREVIATION_FORMAT_REGEX = new RegExp(
  `^${PROJECT_ABBREVIATION_ALLOWED_CHARS}+(?:\\s${PROJECT_ABBREVIATION_ALLOWED_CHARS}+)*$`,
)

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
  validator: (_rule: FormRules[string], value: string, callback: (error?: Error) => void) => {
    if (!value) {
      callback()
      return
    }
    // Create a temporary div to decode HTML entities
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = value
    const decodedValue = tempDiv.textContent || tempDiv.innerText || ''
    // Remove HTML tags and count only actual text content
    const textLength = decodedValue.replace(/<[^>]*>/g, '').length
    if (textLength > length) {
      callback(new Error(t('general.maxCharLimit', { length })))
    } else {
      callback()
    }
  },
  trigger: ['blur', 'change'],
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
  validationStatus?: Ref<AsyncValidationState>,
  onCheckFailed?: (message: string) => void,
) => {
  const debounceTime = 1500
  let debounceTimeout: number | undefined = undefined
  // Every trigger (blur/change, plus programmatic validateField calls) shares this single
  // debounce timer, so a call it supersedes must still be settled here - otherwise that
  // caller's await on validateField hangs forever instead of just being superseded.
  let pendingCallbacks: Array<(error?: Error) => void> = []
  // trigger: ['blur', 'change'] means typing (debounced) and then leaving the field both fire a
  // check. Without this, an unchanged value gets checked against the API twice in a row - once
  // when the debounce settles, again on blur right after. Cache the last value actually checked
  // (technical failures are not cached, so those retry) and reuse it instead of re-hitting the API.
  let lastChecked: { value: string; error?: Error } | undefined
  // Bumped on every invocation. checkUnique() is a real network call that can still be in flight
  // when a newer invocation (e.g. the value becoming regex-invalid) already settled the field -
  // its eventual resolution must not clobber that newer state, so it checks this before applying.
  let currentGeneration = 0

  const flushPending = (error?: Error) => {
    const callbacks = pendingCallbacks
    pendingCallbacks = []
    callbacks.forEach((cb) => cb(error))
  }

  return {
    // async-validator attaches its own .then() to whatever this returns and, the moment that
    // promise settles, calls the field's callback again with no error - silently forcing the
    // field back to "valid" regardless of what our own callback() calls below determine. So this
    // must stay wrapped in a Promise that never resolves/rejects; only our own callback(...)
    // calls (via the debounce below) may ever settle the field's real validation state.
    asyncValidator: (_rule, value: string, callback: (error?: Error) => void) => {
      return new Promise<void>(() => {
        currentGeneration += 1
        const myGeneration = currentGeneration

        if (!value) {
          // Truly empty - defer entirely to the separate `required` rule. A whitespace-only
          // value (e.g. "   ") is NOT empty by that rule's own check (it only tests `!value`,
          // not a trimmed one), so it falls through to the regex check below instead of landing
          // here - and that regex correctly rejects it too, since it never starts with an
          // allowed non-whitespace character.
          if (debounceTimeout !== undefined) {
            window.clearTimeout(debounceTimeout)
            debounceTimeout = undefined
          }
          flushPending()
          if (validationStatus) validationStatus.value = AsyncValidationState.Idle
          callback()
          return
        }

        if (!PROJECT_ABBREVIATION_FORMAT_REGEX.test(value)) {
          // Fails the backend's format rule - reject immediately, without ever calling
          // checkUnique, so an invalid value can never resolve to a false "success".
          if (debounceTimeout !== undefined) {
            window.clearTimeout(debounceTimeout)
            debounceTimeout = undefined
          }
          flushPending()
          if (validationStatus) validationStatus.value = AsyncValidationState.Error
          callback(new Error(t('general.invalidField')))
          return
        }

        pendingCallbacks.push(callback)
        if (debounceTimeout !== undefined) {
          window.clearTimeout(debounceTimeout)
        }
        if (validationStatus) validationStatus.value = AsyncValidationState.Validating

        debounceTimeout = window.setTimeout(
          async () => {
            debounceTimeout = undefined

            if (lastChecked && lastChecked.value === value) {
              if (validationStatus) {
                validationStatus.value = lastChecked.error ? AsyncValidationState.Error : AsyncValidationState.Success
              }
              flushPending(lastChecked.error)
              return
            }

            try {
              const proposalStore = useProposalStore()
              const isUnique = await proposalStore.checkUnique(value, proposalId.value)

              // A newer invocation (e.g. the value has since become regex-invalid, or changed
              // again) already settled the field while this request was in flight - its callback
              // was already resolved then, so applying this now-stale result would silently
              // overwrite that newer, more current state (e.g. flipping the icon back to success).
              if (myGeneration !== currentGeneration) return

              if (isUnique === true) {
                lastChecked = { value }
                if (validationStatus) validationStatus.value = AsyncValidationState.Success
                flushPending()
              } else {
                // Already has visible feedback via the field's own red border + inline message -
                // no need for a notification on top.
                const error = new Error(t('proposal.thereIsAlreadyExistingProposalWithTheName'))
                lastChecked = { value, error }
                if (validationStatus) validationStatus.value = AsyncValidationState.Error
                flushPending(error)
              }
            } catch {
              if (myGeneration !== currentGeneration) return

              // Network/API failure: don't leave the callback hanging (that's what previously
              // left the field stuck 'validating' forever with no red border and no message).
              // Not cached, so the next trigger retries for real instead of repeating the failure.
              const message = t('proposal.projectAbbreviationCheckFailed')
              if (validationStatus) validationStatus.value = AsyncValidationState.Error
              onCheckFailed?.(message)
              flushPending(new Error(message))
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

export const urlValidationFunc = () => ({
  validator: (_rule, value: string, callback) => {
    if (!value) {
      callback()
      return
    }
    try {
      const url = new URL(value)
      if (url.protocol === 'http:' || url.protocol === 'https:') {
        callback()
      } else {
        callback(new Error(t('general.invalidField')))
      }
    } catch (_) {
      callback(new Error(t('general.invalidField')))
    }
  },
  trigger: ['blur', 'change'],
})
