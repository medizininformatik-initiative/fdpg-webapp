import { useAuthStore } from '@/stores/auth/auth.store'
import ProjectReports from '../ProjectReports.vue'
import { createTestingPinia } from '@pinia/testing'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import type { MockedObject } from 'vitest'
import { Role } from '@/types/oidc.types'
import { mockProposal } from '@/mocks/proposal.mock'
import { useMessageBoxStore } from '@/stores/messageBox.store'
import ReportDialog from '../ReportDialog.vue'
import ViewReportDialog from '../ViewReportDialog.vue'
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

describe('ProjectReports.vue', () => {
  let proposalStore: MockedObject<ReturnType<typeof useProposalStore>>
  let authStore: MockedObject<ReturnType<typeof useAuthStore>>
  let messageBoxStore: MockedObject<ReturnType<typeof useMessageBoxStore>>

  let wrapper: VueWrapper
  const mockedUseNotifications = vi.mocked(useNotifications())

  beforeEach(() => {
    wrapper = mount(ProjectReports, {
      props: { accessForMaintenance: true },
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
    await wrapper.findAll('.reports--actions__cursor')[0].trigger('click')
    await flushPromises()
    expect(wrapper.findComponent(ReportDialog).vm.report.title).toEqual('title')
  })
  it('should face error while update', async () => {
    await wrapper.setProps({ isDisabled: true })
    await wrapper.findAll('.reports--actions__cursor')[0].trigger('click')
  })
  it('should reset form', async () => {
    await wrapper.findAll('.reports--actions__cursor')[0].trigger('click')
    await flushPromises()
    wrapper.findComponent(ReportDialog).vm.$emit('reset')
    await flushPromises()
    expect(wrapper.findComponent(ReportDialog).vm.report.title).toEqual('')
  })

  it('should delete current report', async () => {
    await wrapper.find('.fa-trash').trigger('click')
    expect(proposalStore.deleteReport).toHaveBeenCalledTimes(1)
  })

  it('should catch error delete current report', async () => {
    proposalStore.deleteReport.mockRejectedValueOnce(new Error('error'))
    await wrapper.find('.fa-trash').trigger('click')
    expect(proposalStore.deleteReport).toHaveBeenCalledTimes(1)
    expect(mockedUseNotifications.showErrorMessage).toHaveBeenCalledTimes(1)
  })

  it('should prevent default editing current report', async () => {
    wrapper.setProps({ isDisabled: true })
    await flushPromises()
    await wrapper.findAll('.reports--actions__cursor')[0].trigger('click')
  })

  it('should show view mode', async () => {
    await wrapper.setProps({ accessForMaintenance: false })
    await wrapper.findAll('.reports--actions__cursor')[0].trigger('click')
    await flushPromises()
    expect(wrapper.findComponent(ViewReportDialog).vm.report.title).toEqual('title')
  })
})
