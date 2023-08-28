import ViewReportDialog from '../ViewReportDialog.vue'
import FdpgDialog from '../FdpgDialog.vue'
import { ElButton } from 'element-plus'
import { createTestingPinia } from '@pinia/testing'
import { mockProposal } from '@/mocks/proposal.mock'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import { mount, type VueWrapper } from '@vue/test-utils'
import type { MockedObject } from 'vitest'
import type { IReportGet } from '@/types/proposal.types'

vi.mock('vue-i18n', () => ({
  useI18n: vi.fn().mockImplementation(() => ({
    t: vi.fn().mockReturnValue('Test'),
    locale: {
      value: 'de-DE',
    },
  })),
}))

describe('ViewReportDialog.vue', () => {
  let wrapper: VueWrapper
  let proposalStore: MockedObject<ReturnType<typeof useProposalStore>>

  const mockReport: IReportGet = {
    _id: '1',
    content: 'test',
    createdAt: '',
    updatedAt: '',
    title: 'test',
    uploads: [],
  }

  beforeEach(() => {
    wrapper = mount(ViewReportDialog, {
      props: {
        modelValue: false,
        proposalId: mockProposal._id,
        report: mockReport,
      },
      global: {
        plugins: [createTestingPinia()],
        stubs: [],
      },
    })
  })

  beforeEach(() => {
    proposalStore = vi.mocked(useProposalStore())
    proposalStore.getReportContent = vi.fn().mockImplementation(() => {
      return 'test'
    })
  })

  it('renders', () => {
    expect(wrapper).toBeTruthy()
  })

  it('should call the proposalStore to get the report', async () => {
    await wrapper.setProps({ modelValue: true })
    expect(wrapper.findComponent(FdpgDialog)).toBeTruthy()
    expect(proposalStore.getReportContent).toHaveBeenCalledTimes(1)
    const emitted = wrapper.emitted()
    const updatesOnModel = emitted['update:report'] as IReportGet[][]
    expect(updatesOnModel[0][0]).toEqual(mockReport)
  })

  it('should emit reset from dialog', async () => {
    await wrapper.setProps({ modelValue: true })
    const fdpgButton = wrapper.findComponent(ElButton)
    await fdpgButton.trigger('click')
    expect(wrapper.emitted().reset).toBeTruthy()
  })

  it('should emit reset from button', async () => {
    await wrapper.setProps({ modelValue: true })
    const fdpgDialogComponent = wrapper.findComponent(FdpgDialog)
    fdpgDialogComponent.vm.$emit('close')
    expect(wrapper.emitted().reset).toBeTruthy()
  })
})
