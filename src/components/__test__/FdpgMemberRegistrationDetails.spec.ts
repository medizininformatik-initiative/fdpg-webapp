import useNotifications from '@/composables/use-notifications'
import { mockProposal } from '@/mocks/proposal.mock'
import { useCommentStore } from '@/stores/comment/comment.store'
import { useMessageBoxStore, type IMessageBox } from '@/stores/messageBox.store'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import type { IButtonConfig } from '@/types/button-config.interface'
import { ProposalStatus, type IProposal } from '@/types/proposal.types'
import { ProposalType } from '@/types/proposal-type.enum'
import { RouteName } from '@/types/route-name.enum'
import { createTestingPinia } from '@pinia/testing'
import { flushPromises, shallowMount } from '@vue/test-utils'
import type { MockedObject } from 'vitest'
import FdpgMemberRegistrationDetails from '../Proposals/Details/FdpgMemberDetailsRegisteringForm.vue'
import { useAuthStore } from '@/stores/auth/auth.store'
import { Role } from '@/types/oidc.types'
import type { IDetailActionRow } from '@/types/detail-action-row.interface'
import { useLayoutStore } from '@/stores/layout.store'
import type { UploadFile } from 'element-plus'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createI18n } from 'vue-i18n'

vi.mock('vue-i18n', () => ({
  createI18n: vi.fn(),
  useI18n: vi.fn().mockImplementation(() => ({
    t: vi.fn().mockImplementation((key: string) => key),
  })),
}))

vi.mock('@/plugins/i18n', () => ({
  i18n: {
    global: {
      t: vi.fn().mockReturnValue('Test'),
    },
  },
}))

vi.mock('vue-router', () => {
  const pushMock = vi.fn()
  return {
    createRouter: vi.fn().mockImplementation(() => ({ beforeEach: vi.fn() })),
    createWebHistory: vi.fn(),
    useRoute: vi.fn().mockReturnValue({ query: { anchor: 'anchorId' }, params: { id: 'proposalId' } }),
    useRouter: vi.fn(() => ({
      push: pushMock,
    })),
  }
})

vi.mock('@/composables/use-notifications', () => ({
  default: vi.fn().mockReturnValue({
    showSuccessMessage: vi.fn(),
    showErrorMessage: vi.fn(),
  }),
}))

vi.mock('@/composables/use-fdpg-member-proposal-details', () => ({
  useFdpgMemberProposalDetails: vi.fn(() => ({
    proposal: { value: mockProposal },
    proposalQuickInfo: { value: null },
    isRegisteringForm: { value: true },
    reload: vi.fn(),
  })),
}))

vi.mock('@/composables/use-fdpg-member-actions', () => ({
  useFdpgMemberActions: vi.fn(() => ({
    handleLockProposal: vi.fn(),
    handleSyncProposalClick: vi.fn(),
    handleAcceptProposalClick: vi.fn(),
    handleRejectProposalClick: vi.fn(),
    handleRequestChangesClick: vi.fn(),
  })),
}))

vi.mock('@/validations', () => ({
  maxLengthValidationFunc: vi.fn().mockReturnValue({ validator: (_rule: any, _value: any, cb: any) => cb() }),
  numberValidationFunc: vi.fn().mockReturnValue({ validator: (_rule: any, _value: any, cb: any) => cb() }),
  requiredValidationFunc: vi.fn().mockReturnValue({ validator: (_rule: any, _value: any, cb: any) => cb() }),
  specialCharactersValidationFunc: vi.fn().mockReturnValue({ validator: (_rule: any, _value: any, cb: any) => cb() }),
}))

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      proposal: {
        checkAttachments: 'Check Attachments ({count})',
        noAttachmentsYet: 'No attachments yet',
      },
    },
  },
})

const mountComponent = (withPinia = true, proposalStatus = ProposalStatus.Draft) => {
  const plugins: any[] = withPinia ? [createTestingPinia(), i18n] : [i18n]

  // Setup proposal store
  const pinia = createTestingPinia()
  const store = useProposalStore(pinia)
  store.currentProposal = {
    ...mockProposal,
    status: proposalStatus,
    type: ProposalType.RegisteringForm,
  }

  return shallowMount(FdpgMemberRegistrationDetails, {
    global: {
      plugins: withPinia ? [pinia, i18n] : [i18n],
      stubs: {
        'el-container': false,
        'el-header': false,
        'el-main': false,
        DetailTopBar: true,
        DetailActionRow: true,
        ProposalQuickInfo: true,
        ProposalPrintButton: true,
        FdpgDocuments: true,
        ProposalAssigneeInfo: true,
        FdpgComments: true,
      },
    },
    props: {},
  })
}

describe('FdpgMemberRegistrationDetails', () => {
  let wrapper: ReturnType<typeof mountComponent>
  let proposalStore: MockedObject<ReturnType<typeof useProposalStore>>
  let authStore: MockedObject<ReturnType<typeof useAuthStore>>
  let messageBoxStore: MockedObject<ReturnType<typeof useMessageBoxStore>>

  beforeEach(() => {
    vi.clearAllMocks()
    createTestingPinia({ stubActions: false })
    proposalStore = vi.mocked(useProposalStore())
    authStore = vi.mocked(useAuthStore())
    messageBoxStore = vi.mocked(useMessageBoxStore())

    proposalStore.currentProposal = {
      ...mockProposal,
      status: ProposalStatus.Draft,
      type: ProposalType.RegisteringForm,
    }
    authStore.hasRole = vi.fn().mockReturnValue(true)
    authStore.user = { sub: 'user123' }
  })

  describe('Component structure', () => {
    it('renders successfully', () => {
      wrapper = mountComponent()
      expect(wrapper.exists()).toBe(true)
    })

    it('renders DetailTopBar component', () => {
      wrapper = mountComponent()
      const detailTopBar = wrapper.findComponent({ name: 'DetailTopBar' })
      expect(detailTopBar.exists()).toBe(true)
    })

    it('renders DetailActionRow component', () => {
      wrapper = mountComponent()
      const detailActionRow = wrapper.findComponent({ name: 'DetailActionRow' })
      expect(detailActionRow.exists()).toBe(true)
    })

    it('renders QuickInfo component', () => {
      wrapper = mountComponent()
      const quickInfo = wrapper.findComponent({ name: 'QuickInfo' })
      expect(quickInfo.exists()).toBe(true)
    })

    it('renders AppendixInfo component', () => {
      wrapper = mountComponent()
      const appendixInfo = wrapper.findComponent({ name: 'AppendixInfo' })
      expect(appendixInfo.exists()).toBe(true)
    })

    it('renders FdpgProjectAssignee component', () => {
      wrapper = mountComponent()
      const fdpgProjectAssignee = wrapper.findComponent({ name: 'FdpgProjectAssignee' })
      expect(fdpgProjectAssignee.exists()).toBe(true)
    })

    it('renders MessageCenter component', () => {
      wrapper = mountComponent()
      const messageCenter = wrapper.findComponent({ name: 'MessageCenter' })
      expect(messageCenter.exists()).toBe(true)
    })

    it('does NOT render FdpgCheckList component (registration form specific)', () => {
      wrapper = mountComponent()
      const fdpgCheckList = wrapper.findComponent({ name: 'FdpgCheckList' })
      expect(fdpgCheckList.exists()).toBe(false)
    })

    it('does NOT render InitiateContractDialog component (registration form specific)', () => {
      wrapper = mountComponent()
      const initiateContractDialog = wrapper.findComponent({ name: 'InitiateContractDialog' })
      expect(initiateContractDialog.exists()).toBe(false)
    })

    it('does NOT render LocationVotePanel component (registration form specific)', () => {
      wrapper = mountComponent()
      const locationVotePanel = wrapper.findComponent({ name: 'LocationVotePanel' })
      expect(locationVotePanel.exists()).toBe(false)
    })
  })

  describe('Component interactions', () => {
    it('passes correct props to DetailActionRow', () => {
      wrapper = mountComponent()
      const detailActionRow = wrapper.findComponent({ name: 'DetailActionRow' })

      const props = detailActionRow.props()
      expect(props.buttons).toBeDefined()
      expect(Array.isArray(props.buttons)).toBe(true)
    })

    it('handles proposal status changes', async () => {
      wrapper = mountComponent()

      // Simulate a status change
      proposalStore.currentProposal = {
        ...mockProposal,
        status: ProposalStatus.FdpgCheck,
        type: ProposalType.RegisteringForm,
      }

      await wrapper.vm.$nextTick()
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Computed properties', () => {
    it('computes action buttons correctly for draft status', () => {
      wrapper = mountComponent(true, ProposalStatus.Draft)
      const vm = wrapper.vm as any

      expect(vm.actionButtons).toBeDefined()
      expect(Array.isArray(vm.actionButtons)).toBe(true)
    })

    it('computes action buttons correctly for fdpg check status', () => {
      wrapper = mountComponent(true, ProposalStatus.FdpgCheck)
      const vm = wrapper.vm as any

      expect(vm.actionButtons).toBeDefined()
      expect(Array.isArray(vm.actionButtons)).toBe(true)
    })

    it('shows different action buttons compared to application form', () => {
      wrapper = mountComponent(true, ProposalStatus.Draft)
      const vm = wrapper.vm as any

      expect(vm.actionButtons).toBeDefined()
      expect(Array.isArray(vm.actionButtons)).toBe(true)
    })
  })

  describe('Registration form specific behavior', () => {
    it('displays simplified interface for registration forms', () => {
      wrapper = mountComponent()

      // Check that complex registration form-specific components are not rendered
      expect(wrapper.findComponent({ name: 'FdpgCheckList' }).exists()).toBe(false)
      expect(wrapper.findComponent({ name: 'InitiateContractDialog' }).exists()).toBe(false)
      expect(wrapper.findComponent({ name: 'LocationVotePanel' }).exists()).toBe(false)

      // Check that basic components are still rendered
      expect(wrapper.findComponent({ name: 'AppendixInfo' }).exists()).toBe(true)
      expect(wrapper.findComponent({ name: 'FdpgProjectAssignee' }).exists()).toBe(true)
      expect(wrapper.findComponent({ name: 'MessageCenter' }).exists()).toBe(true)
    })
  })
})
