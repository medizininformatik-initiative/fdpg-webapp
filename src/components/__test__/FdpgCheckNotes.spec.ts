import { useAuthStore } from '@/stores/auth/auth.store'
import FdpgCheckNotes from '../FdpgCheckNotes.vue'
import { createTestingPinia } from '@pinia/testing'
import { mount, type VueWrapper } from '@vue/test-utils'
import type { MockedObject } from 'vitest'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import { Role } from '@/types/oidc.types'
import { ElButton } from 'element-plus'
import useNotifications from '@/composables/use-notifications'
import { ProposalStatus, type IProposal } from '@/types/proposal.types'

vi.mock('vue-router', () => ({
  createRouter: vi.fn().mockImplementation(() => ({ beforeEach: vi.fn() })),
  createWebHistory: vi.fn(),
  useRoute: vi.fn().mockReturnValue({ params: { id: 'proposalId' } }),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}))
vi.mock('vue-i18n', () => ({
  useI18n: vi.fn().mockImplementation(() => ({
    t: vi.fn().mockReturnValue('Test'),
    locale: {
      value: 'de-DE',
    },
  })),
}))

vi.mock('@/composables/use-notifications', () => ({
  default: vi.fn().mockReturnValue({
    showSuccessMessage: vi.fn(),
    showErrorMessage: vi.fn(),
  }),
}))

vi.mock('@/plugins/i18n', () => ({
  i18n: {
    global: {
      t: vi.fn().mockReturnValue('Test'),
    },
  },
}))
describe('FdpgCheckNotes.vue', () => {
  let proposalStore: MockedObject<ReturnType<typeof useProposalStore>>
  let authStore: MockedObject<ReturnType<typeof useAuthStore>>
  const { showErrorMessage } = useNotifications()

  let wrapper: VueWrapper
  beforeEach(() => {
    wrapper = mount(FdpgCheckNotes, {
      global: {
        plugins: [createTestingPinia()],
        stubs: [],
      },
    })
    proposalStore = vi.mocked(useProposalStore())
    proposalStore.currentProposal = { status: ProposalStatus.FdpgCheck } as IProposal
    authStore = vi.mocked(useAuthStore())
    authStore.singleKnownRole = Role.FdpgMember
  })

  it('renders', () => {
    expect(wrapper).toBeTruthy()
  })

  it('should update fdpg check notes', async () => {
    const saveButton = wrapper.findComponent(ElButton)
    await saveButton.trigger('click')
    expect(proposalStore.updateFdpgCheckNotes).toBeCalledTimes(1)
  })

  it('should show error message', async () => {
    proposalStore.updateFdpgCheckNotes.mockRejectedValueOnce(new Error())
    const saveButton = wrapper.findComponent(ElButton)
    await saveButton.trigger('click')
    expect(showErrorMessage).toBeCalledTimes(1)
  })
})
