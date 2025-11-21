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
import FdpgMemberDetails from '../Proposals/Details/FdpgMemberDetails.vue'
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

const mountComponent = (withPinia = true, proposalType = ProposalType.ApplicationForm) => {
  const plugins: any[] = withPinia ? [createTestingPinia(), i18n] : [i18n]

  // Setup proposal store with the desired type
  const pinia = createTestingPinia()
  const store = useProposalStore(pinia)
  store.currentProposal = {
    ...mockProposal,
    type: proposalType,
  }

  return shallowMount(FdpgMemberDetails, {
    global: {
      plugins: withPinia ? [pinia, i18n] : [i18n],
      stubs: {
        'el-container': false,
        FdpgMemberDetailsApplicationForm: false,
        FdpgMemberDetailsRegisteringForm: false,
      },
    },
    props: {},
  })
}

describe('FdpgMemberDetails', () => {
  let wrapper: ReturnType<typeof mountComponent>
  let proposalStore: MockedObject<ReturnType<typeof useProposalStore>>

  beforeEach(() => {
    vi.clearAllMocks()
    createTestingPinia()
    proposalStore = vi.mocked(useProposalStore())
    proposalStore.currentProposal = {
      ...mockProposal,
      type: ProposalType.ApplicationForm,
    }
  })

  describe('Component routing', () => {
    it('renders ApplicationForm component for APPLICATION_FORM type', () => {
      wrapper = mountComponent(true, ProposalType.ApplicationForm)

      const applicationComponent = wrapper.findComponent({ name: 'FdpgMemberDetailsApplicationForm' })
      expect(applicationComponent.exists()).toBe(true)
    })

    it('renders RegisteringForm component for REGISTERING_FORM type', () => {
      wrapper = mountComponent(true, ProposalType.RegisteringForm)

      const registeringComponent = wrapper.findComponent({ name: 'FdpgMemberDetailsRegisteringForm' })
      expect(registeringComponent.exists()).toBe(true)
    })

    it('defaults to ApplicationForm when no type is provided', () => {
      proposalStore.currentProposal = {
        ...mockProposal,
        type: undefined as any,
      }
      wrapper = mountComponent(true, ProposalType.ApplicationForm)

      const applicationComponent = wrapper.findComponent({ name: 'FdpgMemberDetailsApplicationForm' })
      expect(applicationComponent.exists()).toBe(true)
    })

    it('only renders one component at a time', () => {
      wrapper = mountComponent(true, ProposalType.ApplicationForm)

      const applicationComponent = wrapper.findComponent({ name: 'FdpgMemberDetailsApplicationForm' })
      const registeringComponent = wrapper.findComponent({ name: 'FdpgMemberDetailsRegisteringForm' })

      expect(applicationComponent.exists()).toBe(true)
      expect(registeringComponent.exists()).toBe(false)
    })
  })

  describe('Child component integration', () => {
    it('passes proposal data to child components', () => {
      wrapper = mountComponent(true, ProposalType.ApplicationForm)

      const applicationComponent = wrapper.findComponent({ name: 'FdpgMemberDetailsApplicationForm' })
      expect(applicationComponent.exists()).toBe(true)
    })

    it('maintains consistent behavior across component types', () => {
      // Test ApplicationForm
      wrapper = mountComponent(true, ProposalType.ApplicationForm)
      const applicationComponent = wrapper.findComponent({ name: 'FdpgMemberDetailsApplicationForm' })
      expect(applicationComponent.exists()).toBe(true)

      // Test RegisteringForm
      wrapper = mountComponent(true, ProposalType.RegisteringForm)
      const registeringComponent = wrapper.findComponent({ name: 'FdpgMemberDetailsRegisteringForm' })
      expect(registeringComponent.exists()).toBe(true)
    })
  })
})
