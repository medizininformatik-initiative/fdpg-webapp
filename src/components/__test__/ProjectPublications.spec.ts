import { useAuthStore } from '@/stores/auth/auth.store'
import { useMessageBoxStore } from '@/stores/messageBox.store'
import ProjectPublications from '../ProjectPublications.vue'
import { createTestingPinia } from '@pinia/testing'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import type { MockedObject } from 'vitest'
import { Role } from '@/types/oidc.types'
import { mockProposal } from '@/mocks/proposal.mock'
import PublicationDialog from '../PublicationDialog.vue'
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

describe('ProjectPublications.vue', () => {
  let proposalStore: MockedObject<ReturnType<typeof useProposalStore>>
  let authStore: MockedObject<ReturnType<typeof useAuthStore>>
  let messageBoxStore: MockedObject<ReturnType<typeof useMessageBoxStore>>

  let wrapper: VueWrapper
  const mockedUseNotifications = vi.mocked(useNotifications())

  beforeEach(() => {
    wrapper = mount(ProjectPublications, {
      props: { accessForMaintenance: true, isDisabled: false },
      global: {
        plugins: [createTestingPinia()],
        stubs: [],
      },
    })
    authStore = vi.mocked(useAuthStore())
    proposalStore = vi.mocked(useProposalStore())
    messageBoxStore = vi.mocked(useMessageBoxStore())
    authStore.singleKnownRole = Role.FdpgMember
    proposalStore.currentProposal = mockProposal
    messageBoxStore.setMessageBoxInfo.mockImplementationOnce((entry) => {
      entry.callback('confirm')
      return Promise.resolve()
    })
  })

  it('renders', () => {
    expect(wrapper).toBeTruthy()
  })

  it('should update modal publication value', async () => {
    await wrapper.find('.fa-edit').trigger('click')
    await flushPromises()
    expect(wrapper.findComponent(PublicationDialog).vm.publication.title).toEqual('ShortCut')
  })
  it('should face error while update', async () => {
    await wrapper.setProps({ isDisabled: true })
    await wrapper.find('.fa-edit').trigger('click')
  })
  it('should reset form', async () => {
    await wrapper.find('.fa-edit').trigger('click')
    await flushPromises()
    wrapper.findComponent(PublicationDialog).vm.$emit('reset')
    await flushPromises()
    expect(wrapper.findComponent(PublicationDialog).vm.publication.title).toEqual('')
  })

  it('should delete current publication', async () => {
    await wrapper.find('.fa-trash').trigger('click')
    expect(proposalStore.deletePublication).toHaveBeenCalledTimes(1)
  })

  it('should raise error for delete current publication', async () => {
    proposalStore.deletePublication.mockRejectedValueOnce(new Error('error'))
    await wrapper.find('.fa-trash').trigger('click')
    expect(proposalStore.deletePublication).toHaveBeenCalledTimes(1)
    expect(mockedUseNotifications.showErrorMessage).toHaveBeenCalledTimes(1)
  })

  it('should catch error when delete current publication', async () => {
    wrapper.setProps({ isDisabled: true })
    await flushPromises()
    await wrapper.find('.fa-trash').trigger('click')
  })
})
