import { useProposalStore } from '@/stores/proposal/proposal.store'
import LocationVotePanel from '../LocationVotePanel.vue'
import { createTestingPinia } from '@pinia/testing'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { ProposalStatus } from '@/types/proposal.types'
import type { MockedObject } from 'vitest'
import { mockProposal } from '@/mocks/proposal.mock'
vi.mock('vue-i18n', () => ({
  useI18n: vi.fn().mockImplementation(() => ({
    t: vi.fn().mockImplementation((entry) => entry),
    locale: {
      value: 'de-DE',
    },
  })),
}))

describe('LocationVotePanel.vue', () => {
  let proposalStore: MockedObject<ReturnType<typeof useProposalStore>>

  let wrapper: VueWrapper
  beforeEach(() => {
    wrapper = mount(LocationVotePanel, {
      props: {},
      global: {
        plugins: [createTestingPinia()],
        stubs: ['el-progress'],
      },
    })
  })

  beforeEach(() => {
    proposalStore = vi.mocked(useProposalStore())
    proposalStore.currentProposal = mockProposal
  })

  it('renders', () => {
    expect(wrapper).toBeTruthy()
  })

  describe.each([ProposalStatus.Archived, ProposalStatus.LocationCheck])(
    'if the status is %s',
    (status: ProposalStatus | undefined) => {
      beforeEach(() => {
        proposalStore.currentProposal = { ...proposalStore.currentProposal, status } as any
      })
      it('should change getParticipants', async () => {
        await flushPromises()
        if (status === ProposalStatus.LocationCheck) {
          expect(wrapper.findAll('h2')[0].text()).toBe('proposal.uacVotum')
        } else {
          expect(wrapper.findAll('h2')[0].text()).toBe('proposal.signedContracts')
        }
      })
    },
  )
})
