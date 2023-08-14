import { useAuthStore } from '@/stores/auth/auth.store'
import ContractParticipants from '../ContractParticipants.vue'
import { createTestingPinia } from '@pinia/testing'
import { mockProposal } from '@/mocks/proposal.mock'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import { mount } from '@vue/test-utils'
import type { IConditionalApproval, IUacApproval } from '@/types/proposal.types'

vi.mock('vue-i18n', () => ({
  useI18n: vi.fn().mockImplementation(() => ({
    t: vi.fn().mockReturnValue('Test'),
    locale: {
      value: 'de-DE',
    },
  })),
}))

vi.mock('vue-router', () => ({
  useRoute: vi.fn().mockReturnValue({ params: { id: 'proposalId' } }),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}))

let authStore: ReturnType<typeof useAuthStore>

describe('ContractParticipants.vue', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(ContractParticipants, {
      global: {
        plugins: [createTestingPinia()],
      },
    })
  })

  beforeEach(() => {
    authStore = vi.mocked(useAuthStore())
  })

  it('renders', () => {
    expect(wrapper).toBeTruthy()
  })

  it('should check the uacFullyApproved value', () => {
    expect(wrapper.vm.uacFullyApproved).toEqual([])
  })

  it('should check the ownerRow status', () => {
    const store = useProposalStore()
    store.currentProposal = mockProposal
    store.currentProposal.contractAcceptedByResearcher = true
    expect(wrapper.vm.ownerRow.status).toEqual({ text: 'proposal.contractSigned', style: 'accepted' })
    store.currentProposal.contractAcceptedByResearcher = false
    store.currentProposal.contractRejectedByResearcher = true
    expect(wrapper.vm.ownerRow.status).toEqual({ text: 'proposal.contractRejected', style: 'rejected' })
  })

  it('should call toggleFullView', () => {
    wrapper.vm.toggleFullView()
    expect(wrapper.vm.isFullView).toEqual(true)
  })

  it('should check the uacFullyApproved status', () => {
    const store = useProposalStore()
    store.currentProposal = mockProposal
    expect(wrapper.vm.uacFullyApproved[0].status).toEqual({ text: 'proposal.contractSigned', style: 'accepted' })
    store.currentProposal.conditionalApprovals = [
      {
        ...mockProposal.conditionalApprovals[0],
        ...{ isContractSigned: false },
      },
    ] as unknown as IConditionalApproval[]
    store.currentProposal.uacApprovals = [
      {
        ...mockProposal.uacApprovals[0],
        ...{ isContractSigned: false },
      },
    ] as unknown as IUacApproval[]
    expect(wrapper.vm.uacFullyApproved[0].status).toEqual({ text: 'proposal.contractRejected', style: 'rejected' })

    store.currentProposal.uacApprovals = [
      {
        ...mockProposal.uacApprovals[0],
        ...{ signedAt: undefined },
      },
    ] as unknown as IUacApproval[]
    expect(wrapper.vm.uacFullyApproved[0].status).toEqual({ text: 'proposal.contractPending', style: 'pending' })
  })
})
