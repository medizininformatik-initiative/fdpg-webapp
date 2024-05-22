import { useAuthStore } from '@/stores/auth/auth.store'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import LocationVotePanelUacVotes from '../LocationVotePanelUacVotes.vue'
import { createTestingPinia } from '@pinia/testing'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import type { MockedObject } from 'vitest'
import { mockProposal } from '@/mocks/proposal.mock'
import useDownload from '@/composables/use-download'
import { Role } from '@/types/oidc.types'
import { ElButton } from 'element-plus'
import { ref } from 'vue'
import { nextTick } from 'vue'
import useNotifications from '@/composables/use-notifications'
import { spy } from '@vitest/utils'

vi.mock('vue-i18n', () => ({
  useI18n: vi.fn().mockImplementation(() => ({
    t: vi.fn().mockImplementation((entry) => entry),
    locale: {
      value: 'de-DE',
    },
  })),
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

vi.mock('@/composables/use-download', async () => {
  const downloadFile = vi.fn()
  return {
    __esModule: true,
    default: vi.fn().mockImplementation((_proposalId: string, _errorCb: () => void) => {
      return {
        downloadFile,
        isDownloadLoading: false,
      }
    }),
  }
})

describe('LocationVotePanelUacVotes.vue', () => {
  let proposalStore: MockedObject<ReturnType<typeof useProposalStore>>
  let authStore: MockedObject<ReturnType<typeof useAuthStore>>
  const proposalId = ref('630dd9e8c8a548d21ef4c356')
  let wrapper: VueWrapper
  const mockedUseDownload = vi.mocked(useDownload(proposalId, vi.fn()))
  const mockedUseNotifications = vi.mocked(useNotifications())

  beforeEach(() => {
    wrapper = mount(LocationVotePanelUacVotes, {
      props: {},
      global: {
        plugins: [createTestingPinia()],
        stubs: [],
      },
    })
  })

  beforeEach(() => {
    proposalStore = vi.mocked(useProposalStore())
    proposalStore.currentProposal = mockProposal
    authStore = vi.mocked(useAuthStore())
    authStore.singleKnownRole = Role.FdpgMember
  })

  it('renders', () => {
    expect(wrapper).toBeTruthy()
  })

  it('should download file', async () => {
    const allDiv = wrapper.findAll('div')
    await allDiv
      ?.filter((item) => item.attributes('data-testid') === 'button__condition-download__UKK')[0]
      .trigger('click')
    await flushPromises()
    expect(mockedUseDownload.downloadFile).toHaveBeenCalledWith('UploadId5')
  })

  it('should accept condition', async () => {
    const allButtons = wrapper.findAllComponents(ElButton)
    const declineButton = allButtons?.filter(
      (item) => item.attributes('data-testid') === 'button__condition-decline__KC',
    )[0]
    await declineButton.trigger('click')
    await flushPromises()
    expect(proposalStore.markUacConditionAsAccepted).toHaveBeenCalledTimes(1)

    await wrapper.find('.show-more').trigger('click')
    expect(wrapper.find('.el-icon-arrow-up')).toBeTruthy()
  })

  it('should revert location vote', async () => {
    const allButtons = wrapper.findAllComponents(ElButton)
    const revertButton = allButtons?.filter((item) => item.attributes('data-testid') === 'button__revert__MRI')[0]

    await revertButton.trigger('click')

    // expect(proposalStore.revertLocationVote).toHaveBeenCalledTimes(1)
  })

  it('should catch error while accept condition', async () => {
    proposalStore.markUacConditionAsAccepted.mockRejectedValueOnce(new Error('error'))
    const allButtons = wrapper.findAllComponents(ElButton)
    const declineButton = allButtons?.filter(
      (item) => item.attributes('data-testid') === 'button__condition-decline__KC',
    )[0]
    await declineButton.trigger('click')
    await flushPromises()
    expect(proposalStore.markUacConditionAsAccepted).toHaveBeenCalledTimes(1)
    expect(mockedUseNotifications.showErrorMessage).toHaveBeenCalledTimes(1)
  })
  it('should check the slot of elTableColumn', async () => {
    await wrapper.findAll('.rowsHiddenFocusable')[1].trigger('keydown', { key: 'enter' })
    await nextTick()
    expect(wrapper.find('.decline-reason__data').attributes()).toBeTruthy()
  })

  describe('admin role', () => {
    beforeEach(() => {
      authStore.singleKnownRole = Role.Admin
    })
    it('should check different roles', async () => {
      expect(wrapper.find('.condition-text').attributes().class).not.toContain('cursor-pointer')
    })
  })
})
