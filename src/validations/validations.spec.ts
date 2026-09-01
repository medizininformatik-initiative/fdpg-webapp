import { useProposalStore } from '@/stores/proposal/proposal.store'
import {
  checkValueShouldBeTrue,
  emailValidationFunc,
  maxLengthValidationFunc,
  numberValidationFunc,
  projectAbbreviationValidationFunc,
  requiredIfEmptyValidationFunc,
  requiredUploadFunc,
  requiredValidationFunc,
  specialCharactersValidationFunc,
  startDateInPastValidationFunc,
} from '.'
import { ref } from 'vue'
import { setImmediate } from 'timers'
import type { IUpload } from '@/types/proposal.types'
import { AsyncValidationState } from '@/types/component.types'
import { describe, expect, it, test, vi } from 'vitest'

vi.mock('@/stores/proposal/proposal.store', () => ({
  useProposalStore: vi.fn().mockReturnValue({
    roles: [],
    checkUnique: vi.fn(),
  }),
}))

vi.mock('@/plugins/i18n', () => ({
  i18n: {
    global: {
      t: vi.fn().mockImplementation((key: string, obj?: any) => key + (obj ? JSON.stringify(obj) : '')),
    },
  },
}))

describe('Validations', () => {
  const mockedProposalStore = vi.mocked(useProposalStore())

  describe('requiredValidationFunc', () => {
    it('should return required validation config', () => {
      const result = requiredValidationFunc()
      expect(result).toEqual({
        type: 'any',
        required: true,
        trigger: ['blur', 'change'],
        message: 'general.requiredField',
      })
    })
  })

  describe('maxLengthValidationFunc', () => {
    it('should return max length validation config', () => {
      const result = maxLengthValidationFunc(10)
      expect(result).toEqual({
        validator: expect.any(Function),
        trigger: ['blur', 'change'],
      })
    })

    it('should validate text length correctly', () => {
      const result = maxLengthValidationFunc(10)
      let callbackResult
      const callback = vi.fn().mockImplementation((error) => {
        callbackResult = error
      })

      // Test with empty value
      result.validator({}, '', callback)
      expect(callbackResult).toBeUndefined()

      // Test with valid length
      result.validator({}, 'short text', callback)
      expect(callbackResult).toBeUndefined()

      // Test with invalid length
      result.validator({}, 'this text is too long for the limit', callback)
      expect(callbackResult).toEqual(new Error('general.maxCharLimit{"length":10}'))
    })
  })

  describe('numberValidationFunc', () => {
    it('should return number validation config', () => {
      const result = numberValidationFunc()
      expect(result).toEqual({
        type: 'number',
        trigger: ['blur', 'change'],
        message: 'general.invalidField',
      })
    })
  })

  describe('emailValidationFunc', () => {
    it('should return email validation config', () => {
      const result = emailValidationFunc()
      expect(result).toEqual({
        type: 'email',
        trigger: ['blur', 'change'],
        message: 'general.invalidField',
      })
    })
  })

  describe('specialCharactersValidationFunc', () => {
    it('should return special characters validation config', () => {
      const result = specialCharactersValidationFunc()
      expect(result.trigger).toEqual(['blur', 'change'])
    })

    test.each(['!Test', '{1}Test', '😀 Emoji', 'T  est'])(
      'should return error message if value is invalid (value: %s)',
      (value: string) => {
        const result = specialCharactersValidationFunc()
        let callbackResult
        const callback = vi.fn().mockImplementation((error) => {
          callbackResult = error
        })

        result.validator({}, value, callback)
        expect(callbackResult).toEqual(new Error('general.invalidField'))
      },
    )

    test.each(['Test@UKL', 'test', 'test-test', '#1Test', 'Test?'])(
      'should call the callback if the value is valid (value: %s)',
      (value) => {
        const result = specialCharactersValidationFunc()
        let callbackResult
        const callback = vi.fn().mockImplementation((error) => {
          callbackResult = error
        })

        result.validator({}, value, callback)
        expect(callbackResult).toBeUndefined()
      },
    )
  })

  describe('checkValueShouldBeTrue', () => {
    it('should return the validation config', () => {
      const result = checkValueShouldBeTrue()
      expect(result.trigger).toEqual(['blur', 'change'])
    })

    test.each([false, undefined])('should return error message if value is invalid (value: %s)', (value) => {
      const result = checkValueShouldBeTrue()
      let callbackResult
      const callback = vi.fn().mockImplementation((error) => {
        callbackResult = error
      })

      result.validator({}, value, callback)
      expect(callbackResult).toEqual(new Error('general.requiredField'))
    })

    it('should call the callback if the value is valid', () => {
      const result = checkValueShouldBeTrue()
      let callbackResult
      const callback = vi.fn().mockImplementation((error) => {
        callbackResult = error
      })

      result.validator({}, true, callback)
      expect(callbackResult).toBeUndefined()
    })
  })

  describe('requiredIfEmptyValidationFunc', () => {
    it('should return the validation config', () => {
      const otherField = ref('test')
      const result = requiredIfEmptyValidationFunc(otherField)
      expect(result.trigger).toEqual(['blur', 'change'])
    })

    describe.each([['not empty'], 'string', { key: 'value' }])(
      'if the other value is existing (otherFieldValue: %s)',
      () => {
        test.each(['', undefined])('should call the callback if the value is valid (value: %s)', (value) => {
          const otherField = ref('test')
          const result = requiredIfEmptyValidationFunc(otherField)
          let callbackResult
          const callback = vi.fn().mockImplementation((error) => {
            callbackResult = error
          })

          result.validator({}, value, callback)
          expect(callbackResult).toBeUndefined()
        })
      },
    )

    describe.each([[], '', {}])('if the other value is not existing (otherFieldValue: %s)', () => {
      test.each(['', undefined])('should return error message if value is invalid (value: %s)', (value) => {
        const otherField = ref('')
        const result = requiredIfEmptyValidationFunc(otherField)
        let callbackResult
        const callback = vi.fn().mockImplementation((error) => {
          callbackResult = error
        })

        result.validator({}, value, callback)
        expect(callbackResult).toEqual(new Error('general.oneFieldRequired'))
      })
    })
  })

  describe('projectAbbreviationValidationFunc', () => {
    const proposalId = ref('proposalId')
    const bypassDebounce = ref(true)

    it('should return the validation config', () => {
      const result = projectAbbreviationValidationFunc(proposalId, bypassDebounce)
      expect(result.trigger).toEqual(['blur', 'change'])
    })

    it('should return error message if value is not unique', async () => {
      vi.useFakeTimers()
      const result = projectAbbreviationValidationFunc(proposalId, bypassDebounce)
      let callbackResult: any
      const callback = vi.fn().mockImplementation((error) => {
        callbackResult = error
      })

      mockedProposalStore.checkUnique.mockResolvedValue(false)
      result.asyncValidator({}, 'test', callback).then(() => {
        console.log('Never hits here')
      })

      vi.runAllTimers()
      const flushPromises = () => new Promise(setImmediate)
      await flushPromises()
      expect(callbackResult).toEqual(new Error('proposal.thereIsAlreadyExistingProposalWithTheName'))
      expect.assertions(1)
    })

    describe('format check (mirrors the backend PROPOSAL_SHORTCUT_REGEX)', () => {
      it.each([
        [' test', 'leading space'],
        ['test ', 'trailing space'],
        ['te  st', 'double space'],
        ['te;st', 'disallowed character'],
      ])('rejects "%s" (%s) without ever calling the uniqueness check', async (value) => {
        vi.useFakeTimers()
        const validationStatus = ref(AsyncValidationState.Idle)
        const result = projectAbbreviationValidationFunc(proposalId, bypassDebounce, validationStatus)
        let callbackResult: any
        const callback = vi.fn().mockImplementation((error) => {
          callbackResult = error
        })

        mockedProposalStore.checkUnique.mockClear()
        mockedProposalStore.checkUnique.mockResolvedValue(true)
        result.asyncValidator({}, value, callback)

        vi.runAllTimers()
        const flushPromises = () => new Promise(setImmediate)
        await flushPromises()

        expect(callbackResult).toEqual(new Error('general.invalidField'))
        expect(validationStatus.value).toEqual(AsyncValidationState.Error)
        expect(mockedProposalStore.checkUnique).not.toHaveBeenCalled()
      })

      it.each([['test'], ['test-2'], ['te st'], ['a&b/c#d@e']])(
        'accepts "%s" and proceeds to the uniqueness check',
        async (value) => {
          vi.useFakeTimers()
          const result = projectAbbreviationValidationFunc(proposalId, bypassDebounce)
          const callback = vi.fn()

          mockedProposalStore.checkUnique.mockClear()
          mockedProposalStore.checkUnique.mockResolvedValue(true)
          result.asyncValidator({}, value, callback)

          vi.runAllTimers()
          const flushPromises = () => new Promise(setImmediate)
          await flushPromises()

          expect(mockedProposalStore.checkUnique).toHaveBeenCalledWith(value, 'proposalId')
        },
      )

      it('does not let an in-flight (already unique) check overwrite a newer regex-invalid result', async () => {
        vi.useFakeTimers()
        const debounced = ref(false)
        const validationStatus = ref(AsyncValidationState.Idle)
        const result = projectAbbreviationValidationFunc(proposalId, debounced, validationStatus)
        const flushPromises = () => new Promise(setImmediate)

        let resolveCheckUnique: (value: boolean) => void
        mockedProposalStore.checkUnique.mockClear()
        mockedProposalStore.checkUnique.mockReturnValueOnce(
          new Promise((resolve) => {
            resolveCheckUnique = resolve
          }),
        )

        // "test" is valid and passes format - starts the (still-pending) uniqueness check.
        result.asyncValidator({}, 'test', vi.fn())
        vi.runAllTimers()
        await flushPromises()
        expect(validationStatus.value).toEqual(AsyncValidationState.Validating)

        // While that check is still in flight, the user keeps typing and the value becomes
        // regex-invalid (trailing space) - this settles immediately as an error.
        const laterCallback = vi.fn()
        result.asyncValidator({}, 'test ', laterCallback)
        expect(validationStatus.value).toEqual(AsyncValidationState.Error)
        expect(laterCallback).toHaveBeenCalledWith(new Error('general.invalidField'))

        // The original (now-stale) check finally resolves as unique.
        resolveCheckUnique!(true)
        await flushPromises()

        expect(validationStatus.value).toEqual(AsyncValidationState.Error)
      })
    })

    it('should call the callback if the value is unique', async () => {
      vi.useFakeTimers()
      const result = projectAbbreviationValidationFunc(proposalId, bypassDebounce)
      let callbackResult: any
      const callback = vi.fn().mockImplementation((error) => {
        callbackResult = error
      })

      mockedProposalStore.checkUnique.mockResolvedValue(true)
      result.asyncValidator({}, 'test', callback).then(() => {
        console.log('Never hits here')
      })

      vi.runAllTimers()
      const flushPromises = () => new Promise(setImmediate)
      await flushPromises()
      expect(callbackResult).toBeUndefined()
      expect.assertions(1)
    })

    it('does not hang and reports the failure if the uniqueness check rejects', async () => {
      vi.useFakeTimers()
      const validationStatus = ref(AsyncValidationState.Idle)
      const onCheckFailed = vi.fn()
      const result = projectAbbreviationValidationFunc(proposalId, bypassDebounce, validationStatus, onCheckFailed)
      let callbackResult: any
      const callback = vi.fn().mockImplementation((error) => {
        callbackResult = error
      })

      mockedProposalStore.checkUnique.mockRejectedValue(new Error('Network Error'))
      result.asyncValidator({}, 'test', callback)

      vi.runAllTimers()
      const flushPromises = () => new Promise(setImmediate)
      await flushPromises()

      expect(callback).toHaveBeenCalledTimes(1)
      expect(callbackResult).toBeInstanceOf(Error)
      expect(validationStatus.value).toEqual(AsyncValidationState.Error)
      expect(onCheckFailed).toHaveBeenCalledWith('proposal.projectAbbreviationCheckFailed')
    })

    it('does not fire a notification when the abbreviation is already taken (the field already shows this inline)', async () => {
      vi.useFakeTimers()
      const validationStatus = ref(AsyncValidationState.Idle)
      const onCheckFailed = vi.fn()
      const result = projectAbbreviationValidationFunc(proposalId, bypassDebounce, validationStatus, onCheckFailed)
      let callbackResult: any
      const callback = vi.fn().mockImplementation((error) => {
        callbackResult = error
      })

      mockedProposalStore.checkUnique.mockResolvedValue(false)
      result.asyncValidator({}, 'test', callback)

      vi.runAllTimers()
      const flushPromises = () => new Promise(setImmediate)
      await flushPromises()

      expect(callbackResult).toEqual(new Error('proposal.thereIsAlreadyExistingProposalWithTheName'))
      expect(validationStatus.value).toEqual(AsyncValidationState.Error)
      expect(onCheckFailed).not.toHaveBeenCalled()
    })

    it('settles every callback triggered within the debounce window instead of orphaning earlier ones', async () => {
      vi.useFakeTimers()
      const debounced = ref(false)
      const validationStatus = ref(AsyncValidationState.Idle)
      const result = projectAbbreviationValidationFunc(proposalId, debounced, validationStatus)

      const firstCallback = vi.fn()
      const secondCallback = vi.fn()

      mockedProposalStore.checkUnique.mockClear()
      mockedProposalStore.checkUnique.mockResolvedValue(true)
      result.asyncValidator({}, 'test', firstCallback)
      result.asyncValidator({}, 'test', secondCallback)

      vi.runAllTimers()
      const flushPromises = () => new Promise(setImmediate)
      await flushPromises()

      expect(firstCallback).toHaveBeenCalledTimes(1)
      expect(secondCallback).toHaveBeenCalledTimes(1)
      expect(mockedProposalStore.checkUnique).toHaveBeenCalledTimes(1)
    })

    it('resolves immediately without calling the API when the value is empty', () => {
      const validationStatus = ref(AsyncValidationState.Validating)
      const result = projectAbbreviationValidationFunc(proposalId, bypassDebounce, validationStatus)
      const callback = vi.fn()

      mockedProposalStore.checkUnique.mockClear()
      // The returned promise intentionally never settles (see the comment in the source) so
      // async-validator can't force a false "valid" callback of its own - only callback() drives
      // the result here, and it fires synchronously for the empty-value guard.
      result.asyncValidator({}, '', callback)

      expect(callback).toHaveBeenCalledWith()
      expect(mockedProposalStore.checkUnique).not.toHaveBeenCalled()
      expect(validationStatus.value).toEqual(AsyncValidationState.Idle)
    })

    it('rejects a whitespace-only value as invalid rather than treating it as empty/idle', () => {
      const validationStatus = ref(AsyncValidationState.Idle)
      const result = projectAbbreviationValidationFunc(proposalId, bypassDebounce, validationStatus)
      const callback = vi.fn()

      // async-validator's own `required` check only tests `!value`, so a whitespace-only value
      // like "   " is NOT caught by `required` - it must be caught here instead, not waved
      // through as idle, otherwise the field could end up looking fully valid with no content.
      mockedProposalStore.checkUnique.mockClear()
      result.asyncValidator({}, '   ', callback)

      expect(callback).toHaveBeenCalledWith(new Error('general.invalidField'))
      expect(mockedProposalStore.checkUnique).not.toHaveBeenCalled()
      expect(validationStatus.value).toEqual(AsyncValidationState.Error)
    })

    it('does not re-check the API for an unchanged value on a later trigger (e.g. blur right after typing settles)', async () => {
      vi.useFakeTimers()
      const debounced = ref(false)
      const validationStatus = ref(AsyncValidationState.Idle)
      const result = projectAbbreviationValidationFunc(proposalId, debounced, validationStatus)
      const flushPromises = () => new Promise(setImmediate)

      mockedProposalStore.checkUnique.mockClear()
      mockedProposalStore.checkUnique.mockResolvedValue(true)

      const changeCallback = vi.fn()
      result.asyncValidator({}, 'test', changeCallback)
      vi.runAllTimers()
      await flushPromises()
      expect(changeCallback).toHaveBeenCalledWith(undefined)
      expect(mockedProposalStore.checkUnique).toHaveBeenCalledTimes(1)

      const blurCallback = vi.fn()
      result.asyncValidator({}, 'test', blurCallback)
      vi.runAllTimers()
      await flushPromises()

      expect(blurCallback).toHaveBeenCalledWith(undefined)
      expect(mockedProposalStore.checkUnique).toHaveBeenCalledTimes(1)
      expect(validationStatus.value).toEqual(AsyncValidationState.Success)
    })

    it('does re-check the API once the value actually changes', async () => {
      vi.useFakeTimers()
      const debounced = ref(false)
      const validationStatus = ref(AsyncValidationState.Idle)
      const result = projectAbbreviationValidationFunc(proposalId, debounced, validationStatus)
      const flushPromises = () => new Promise(setImmediate)

      mockedProposalStore.checkUnique.mockClear()
      mockedProposalStore.checkUnique.mockResolvedValue(true)

      result.asyncValidator({}, 'test', vi.fn())
      vi.runAllTimers()
      await flushPromises()

      result.asyncValidator({}, 'test-2', vi.fn())
      vi.runAllTimers()
      await flushPromises()

      expect(mockedProposalStore.checkUnique).toHaveBeenCalledTimes(2)
    })
  })

  describe('requiredUploadFunc', () => {
    it('should return the validation config', () => {
      const uploads = ref([])
      const result = requiredUploadFunc(uploads)
      expect(result.trigger).toEqual(['blur', 'change'])
    })

    it('should return error message if uploads are not existing', async () => {
      const uploads = ref([])
      const result = requiredUploadFunc(uploads)
      let callbackResult: any
      const callback = vi.fn().mockImplementation((error) => {
        callbackResult = error
      })

      result.validator({}, '', callback)
      expect(callbackResult).toEqual(new Error('general.requiredField'))
    })

    it('should call the callback if uploads are existing', async () => {
      const uploads = ref(['test'] as any as IUpload[])
      const result = requiredUploadFunc(uploads)
      let callbackResult: any
      const callback = vi.fn().mockImplementation((error) => {
        callbackResult = error
      })

      result.validator({}, '', callback)
      expect(callbackResult).toBeUndefined()
    })
  })

  describe('startDateInPastValidationFunc', () => {
    it('should return the validation config', () => {
      const result = startDateInPastValidationFunc()
      expect(result.trigger).toEqual(['blur', 'change'])
    })
    it('should return error message if date is in the past', () => {
      const value = '2022-09-29T22:00:00.000Z'
      const result = startDateInPastValidationFunc()
      let callbackResult
      const callback = vi.fn().mockImplementation((error) => {
        callbackResult = error
      })

      result.validator({}, value, callback)
      expect(callbackResult).toEqual(new Error('general.startDateInPast'))
    })

    it('should call the callback if the value is valid', () => {
      const value = new Date().toString()
      const result = startDateInPastValidationFunc()
      let callbackResult
      const callback = vi.fn().mockImplementation((error) => {
        callbackResult = error
      })

      result.validator({}, value, callback)
      expect(callbackResult).toBeUndefined()
    })
  })
})
