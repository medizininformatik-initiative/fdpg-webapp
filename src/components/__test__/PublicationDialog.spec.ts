import PublicationDialog from '../PublicationDialog.vue'
import { createTestingPinia } from '@pinia/testing'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import type { IPublicationGet } from '@/types/proposal.types'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import type { MockedObject } from 'vitest'
import FdpgDialog from '../FdpgDialog.vue'
import { ElButton } from 'element-plus'
import useNotifications from '@/composables/use-notifications'

vi.mock('@/validations', () => ({
  checkValueShouldBeTrue: vi.fn().mockReturnValue({ validator: (_rule: any, _value: any, cb: any) => cb() }),
  maxLengthValidationFunc: vi.fn().mockReturnValue({ validator: (_rule: any, _value: any, cb: any) => cb() }),
  numberValidationFunc: vi.fn().mockReturnValue({ validator: (_rule: any, _value: any, cb: any) => cb() }),
  projectAbbreviationValidationFunc: vi.fn().mockReturnValue({ validator: (_rule: any, _value: any, cb: any) => cb() }),
  requiredIfEmptyValidationFunc: vi.fn().mockReturnValue({ validator: (_rule: any, _value: any, cb: any) => cb() }),
  requiredUploadFunc: vi.fn().mockReturnValue({ validator: (_rule: any, _value: any, cb: any) => cb() }),
  requiredValidationFunc: vi.fn().mockReturnValue({ validator: (_rule: any, _value: any, cb: any) => cb() }),
  specialCharactersValidationFunc: vi.fn().mockReturnValue({ validator: (_rule: any, _value: any, cb: any) => cb() }),
}))

vi.mock('@/composables/use-notifications', async () => {
  const showErrorMessage = vi.fn()
  const showSuccessMessage = vi.fn()
  return {
    __esModule: true,
    default: vi.fn().mockImplementation(() => {
      return {
        showErrorMessage,
        showSuccessMessage,
      }
    }),
  }
})

describe('PublicationDialog.vue', () => {
  let proposalStore: MockedObject<ReturnType<typeof useProposalStore>>

  let wrapper: VueWrapper
  const mockedUseNotifications = vi.mocked(useNotifications())
  beforeEach(() => {
    wrapper = mount(PublicationDialog, {
      props: {
        publication: {
          updatedAt: 'string',
          createdAt: 'string',
          _id: 'string',
          doi: 'doi',
          title: 'title',
          link: 'link',
        } as IPublicationGet,

        proposalId: 'proposalId',
        modelValue: true,
      },
      global: {
        plugins: [createTestingPinia()],
        stubs: [],
      },
    })
  })

  beforeEach(() => {
    proposalStore = vi.mocked(useProposalStore())
  })

  it('renders', () => {
    expect(wrapper).toBeTruthy()
  })

  it('should emit close', async () => {
    wrapper.findComponent(FdpgDialog).vm.$emit('close')
    expect(wrapper.emitted('reset')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
  })

  it('should create or update publication', async () => {
    await wrapper.findAllComponents(ElButton)[1].trigger('click')
    await flushPromises()
    expect(proposalStore.updateProposalPublication).toHaveBeenCalledTimes(1)
  })

  it('should catch error create or update publication', async () => {
    proposalStore.updateProposalPublication.mockRejectedValueOnce(new Error('error'))
    await flushPromises()
    await wrapper.findAllComponents(ElButton)[1].trigger('click')
    await flushPromises()
    expect(proposalStore.updateProposalPublication).toHaveBeenCalledTimes(1)
    expect(mockedUseNotifications.showErrorMessage).toHaveBeenCalledTimes(1)
  })
})
