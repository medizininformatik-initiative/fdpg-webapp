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
} from '.'
import { ref } from 'vue'
import { setImmediate } from 'timers'
import type { IUpload } from '@/types/proposal.types'

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
        max: 10,
        trigger: ['blur', 'change'],
        message: 'general.maxCharLimit' + JSON.stringify({ length: 10 }),
      })
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
    const mockedProposalStore = vi.mocked(useProposalStore())

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
})
