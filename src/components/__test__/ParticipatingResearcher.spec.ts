import { useAuthStore } from '@/stores/auth/auth.store'
import ParticipatingResearcher from '../ParticipatingResearcher.vue'
import { createTestingPinia } from '@pinia/testing'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { ParticipantType, type IResearcherIdentity } from '@/types/proposal.types'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import type { MockedObject } from 'vitest'
import { Role } from '@/types/oidc.types'
import { mockProposal } from '@/mocks/proposal.mock'
import { useUserStore } from '@/stores/user.store'
import { ElButton } from 'element-plus'

vi.mock('vue-i18n', () => ({
  useI18n: vi.fn().mockImplementation(() => ({
    t: vi.fn().mockReturnValue('Test'),
    locale: {
      value: 'de-DE',
    },
  })),
}))

vi.mock('vue-router', () => ({
  createRouter: vi.fn().mockImplementation(() => ({ beforeEach: vi.fn() })),
  createWebHistory: vi.fn(),
  useRoute: vi.fn().mockReturnValue({ params: { id: 'proposalId' } }),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}))

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

describe('ParticipatingResearcher.vue', () => {
  let proposalStore: MockedObject<ReturnType<typeof useProposalStore>>
  let authStore: MockedObject<ReturnType<typeof useAuthStore>>
  let userStore: MockedObject<ReturnType<typeof useUserStore>>

  let wrapper: VueWrapper
  beforeEach(() => {
    createTestingPinia()
    authStore = vi.mocked(useAuthStore())
    proposalStore = vi.mocked(useProposalStore())
    userStore = vi.mocked(useUserStore())
    authStore.singleKnownRole = Role.FdpgMember
    proposalStore.currentProposal = mockProposal
    proposalStore.getResearcherInfo.mockResolvedValue([
      {
        title: 'string',
        firstName: 'string',
        lastName: 'string',
        affiliation: 'string',
        email: 'string',
        isExisting: true,
        isEmailVerified: true,
        isRegistrationComplete: true,
        participantType: ParticipantType.AdditionalProjectLeader,
        username: 'string',
      },
      {
        title: 'string',
        firstName: 'string',
        lastName: 'string',
        affiliation: 'string',
        email: 'string',
        isExisting: true,
        isEmailVerified: true,
        isRegistrationComplete: false,
        participantType: ParticipantType.AdditionalProjectLeader,
        username: 'string',
      },
      {
        title: 'string',
        firstName: 'string',
        lastName: 'string',
        affiliation: 'string',
        email: 'string',
        isExisting: false,
        isEmailVerified: true,
        isRegistrationComplete: false,
        participantType: ParticipantType.AdditionalProjectLeader,
        username: 'string',
      },
    ] as IResearcherIdentity[])
    wrapper = mount(ParticipatingResearcher, {
      props: {},
      global: {
        plugins: [],
        stubs: [],
      },
    })
  })

  describe('mock Stores', () => {
    beforeEach(() => {})

    it('renders', async () => {
      await flushPromises()
      expect(wrapper).toBeTruthy()
    })
    it('should catch error calling get researcher info', async () => {
      await flushPromises()
      proposalStore.getResearcherInfo.mockRejectedValueOnce(new Error('error'))
    })
    it('should call create user', async () => {
      await flushPromises()
      wrapper.findAll('.el-icon-arrow-down').forEach((e) => e.trigger('keyup.enter'))
      await flushPromises()
      wrapper.findAllComponents(ElButton)[0].trigger('click')
      expect(userStore.create).toHaveBeenCalledTimes(1)
    })

    it('should call resend invitation', async () => {
      await flushPromises()
      wrapper.findAll('.el-icon-arrow-down').forEach((e) => e.trigger('keyup.enter'))
      await flushPromises()
      wrapper.findAllComponents(ElButton)[1].trigger('click')
      expect(userStore.resendInvitation).toHaveBeenCalledTimes(1)
    })

    it('should catch error call create user', async () => {
      await flushPromises()
      wrapper.findAll('.el-icon-arrow-down').forEach((e) => e.trigger('keyup.enter'))
      await flushPromises()
      userStore.create.mockRejectedValueOnce(new Error('error'))
      wrapper.findAllComponents(ElButton)[0].trigger('click')
      expect(userStore.create).toHaveBeenCalledTimes(1)
    })

    it('should call resend invitation', async () => {
      await flushPromises()
      wrapper.findAll('.el-icon-arrow-down').forEach((e) => e.trigger('keyup.enter'))
      await flushPromises()
      userStore.resendInvitation.mockRejectedValueOnce(new Error('error'))
      wrapper.findAllComponents(ElButton)[1].trigger('click')
      expect(userStore.resendInvitation).toHaveBeenCalledTimes(1)
    })
  })
})
