import { useAuthStore } from '@/stores/auth/auth.store'
import ProjectStatus from '../ProjectStatus.vue'
import { createTestingPinia } from '@pinia/testing'
import { mount, type VueWrapper } from '@vue/test-utils'
import { ProposalStatus } from '@/types/proposal.types'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import type { MockedObject } from 'vitest'
import { Role } from '@/types/oidc.types'
import { mockProposal } from '@/mocks/proposal.mock'

describe('ProjectStatus.vue', () => {
  let proposalStore: MockedObject<ReturnType<typeof useProposalStore>>
  let authStore: MockedObject<ReturnType<typeof useAuthStore>>

  let wrapper: VueWrapper
  beforeEach(() => {
    wrapper = mount(ProjectStatus, {
      props: { proposalStatus: ProposalStatus.Archived },
      global: {
        plugins: [createTestingPinia()],
        stubs: [],
      },
    })
    authStore = vi.mocked(useAuthStore())
    proposalStore = vi.mocked(useProposalStore())
    authStore.singleKnownRole = Role.FdpgMember
    proposalStore.currentProposal = mockProposal
  })
  it('renders', () => {
    expect(wrapper).toBeTruthy()
  })
})
