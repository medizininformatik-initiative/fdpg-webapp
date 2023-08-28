import ReportDialog from '../ReportDialog.vue'
import { createTestingPinia } from '@pinia/testing'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import type { IReportGet } from '@/types/proposal.types'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import type { MockedObject } from 'vitest'
import FdpgDialog from '../FdpgDialog.vue'
import { ElButton, type UploadFile } from 'element-plus'
import useNotifications from '@/composables/use-notifications'
import FdpgUpload from '../FdpgUpload.vue'
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
URL.createObjectURL = vi.fn().mockImplementation(() => 'asdf')

describe('ReportDialog.vue', () => {
  let proposalStore: MockedObject<ReturnType<typeof useProposalStore>>
  let wrapper: VueWrapper
  const mockedUseNotifications = vi.mocked(useNotifications())

  beforeEach(() => {
    wrapper = mount(ReportDialog, {
      props: {
        report: {
          updatedAt: 'string',
          createdAt: 'string',
          _id: 'string',
          title: 'title',
          content: 'link',
          uploads: [],
        } as IReportGet,
        proposalId: 'proposalId',
        modelValue: false,
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

  it('renders', async () => {
    await flushPromises()
    expect(wrapper).toBeTruthy()
    await wrapper.setProps({ modelValue: true })
    expect(wrapper.emitted('update:report')).toBeTruthy()
  })

  it('should emit close', async () => {
    wrapper.findComponent(FdpgDialog).vm.$emit('close')
    expect(wrapper.emitted('reset')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
  })

  it('should update report', async () => {
    await wrapper.setProps({ modelValue: true })
    await flushPromises()
    await wrapper.findAllComponents(ElButton)[2].trigger('click')
    await flushPromises()
    expect(proposalStore.updateProposalReport).toHaveBeenCalledTimes(1)
  })

  it('should create report', async () => {
    await wrapper.setProps({
      report: {
        updatedAt: 'string',
        createdAt: 'string',
        _id: '',
        title: 'title',
        content: 'link',
        uploads: [],
      } as IReportGet,
      modelValue: true,
      proposalId: 'proposalId',
    })
    await flushPromises()
    await wrapper.findAllComponents(ElButton)[2].trigger('click')
    await flushPromises()
    expect(proposalStore.createProposalReport).toHaveBeenCalledTimes(1)
  })

  it('should raise error create or update report', async () => {
    proposalStore.updateProposalReport.mockRejectedValueOnce(new Error('error'))
    await wrapper.setProps({ modelValue: true })
    await flushPromises()
    await wrapper.findAllComponents(ElButton)[2].trigger('click')
    await flushPromises()
    expect(proposalStore.updateProposalReport).toHaveBeenCalledTimes(1)
    expect(mockedUseNotifications.showErrorMessage).toHaveBeenCalledTimes(1)
  })

  it('should emit change from fdpgUpload', async () => {
    await wrapper.setProps({ modelValue: true })
    await flushPromises()
    const fdpgUploadComponent = wrapper.findComponent(FdpgUpload)
    await fdpgUploadComponent.vm.$emit('change', { raw: true, name: 'str' } as unknown as UploadFile)
  })

  it('should emit remove from fdpgUpload', async () => {
    await wrapper.setProps({ modelValue: true })
    await flushPromises()
    const fdpgUploadComponent = wrapper.findComponent(FdpgUpload)
    await fdpgUploadComponent.vm.$emit('change', { raw: true, name: 'str' } as unknown as UploadFile)
    await fdpgUploadComponent.vm.$emit('remove', '')
  })
})
