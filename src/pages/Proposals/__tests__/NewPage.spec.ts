import { Role } from '@/types/oidc.types'
import { createTestingPinia } from '@pinia/testing'
import { flushPromises, shallowMount } from '@vue/test-utils'
import NewPage from '../NewPage.vue'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import { useCommentStore } from '@/stores/comment/comment.store'
import type { MockedObject } from 'vitest'
import { mockProposal } from '@/mocks/proposal.mock'
import { ProposalStatus, type IProposal } from '@/types/proposal.types'
import useNotifications from '@/composables/use-notifications'
import { useRouter } from 'vue-router'
import { RouteName } from '@/types/route-name.enum'
import type { ValidateFieldsError } from 'async-validator'

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

vi.mock('vue-i18n', () => ({
  createI18n: vi.fn(),
  useI18n: vi.fn().mockImplementation(() => ({
    t: vi.fn().mockImplementation((key: string) => key),
  })),
}))

vi.mock('vue-router', () => {
  const pushMock = vi.fn()
  return {
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

const mountComponent = (withPinia = true) => {
  const plugins: any[] = withPinia ? [createTestingPinia()] : []
  return shallowMount(NewPage, {
    global: {
      plugins,
      stubs: {
        'el-container': false,
        'el-form': false,
        'el-row': false,
        'el-col': false,
        'el-button': false,
      },
    },
    props: {
      userRole: Role.Researcher,
    },
  })
}

type VmType = {
  handleSaveDraft: () => Promise<void>
  handleSubmit: () => Promise<void>
  isTermsDialogOpen: boolean
}

describe('UserProjectInformation.vue', () => {
  let wrapper: ReturnType<typeof mountComponent> & { vm: VmType }
  let proposalStore: MockedObject<ReturnType<typeof useProposalStore>>
  let commentStore: MockedObject<ReturnType<typeof useCommentStore>>

  const { showSuccessMessage, showErrorMessage } = useNotifications()

  const anchorMock = {
    scrollIntoView: vi.fn(),
  }

  const getButtonByText = (text: string) => {
    const buttons = wrapper.findAll('button')
    return buttons.filter((button) => button.text() === text)[0]
  }

  describe('In any case', () => {
    let proposal: IProposal

    it('renders', () => {
      expect(wrapper).toBeTruthy()
    })

    beforeEach(() => {
      vi.clearAllMocks()
      vi.spyOn(document, 'getElementById').mockReturnValue(anchorMock as any)

      proposal = JSON.parse(JSON.stringify(mockProposal))
      wrapper = mountComponent() as any
      proposalStore = vi.mocked(useProposalStore())
      commentStore = vi.mocked(useCommentStore())
      proposalStore.currentProposal = proposal
    })

    it('sets the currentProposal', () => {
      expect(proposalStore.setCurrentProposal).toHaveBeenCalledWith('proposalId')
    })

    it('fetches the comments', () => {
      expect(commentStore.fetchAll).toHaveBeenCalledWith({ proposalId: 'proposalId' })
    })

    it('scrolls to the anchor', async () => {
      await flushPromises()
      expect(anchorMock.scrollIntoView).toHaveBeenCalledWith({ block: 'start', behavior: 'smooth' })
    })

    it('navigates to the detail page on detail button press', async () => {
      const router = useRouter()
      const button = getButtonByText('proposal.projectDetails')
      await button.trigger('click')
      expect(router.push).toHaveBeenCalledWith({ name: RouteName.ProposalDetails, params: { id: proposal._id } })
    })
  })

  describe.each([ProposalStatus.Draft, ProposalStatus.Rework, undefined])(
    'When the proposal is editable with status %s',
    (status?: ProposalStatus) => {
      let proposal: IProposal
      beforeEach(() => {
        proposal = JSON.parse(
          JSON.stringify({ ...mockProposal, status: status, _id: status ? 'proposalId' : undefined }),
        )
        wrapper = mountComponent() as any
        proposalStore = vi.mocked(useProposalStore())
        commentStore = vi.mocked(useCommentStore())
        proposalStore.currentProposal = proposal
      })

      it('renders the action buttons', async () => {
        const row = wrapper.find('.action-wrapper')
        expect(row.exists()).toBe(true)
      })

      it('sets review mode to false', () => {
        const component = wrapper.findComponent({ name: 'UserProjectInformation' })
        expect(component.props().reviewMode).toBe(false)
      })

      describe('handles saving as draft', () => {
        beforeEach(async () => {
          proposalStore.updateProposal.mockResolvedValueOnce({
            ...proposal,
            projectAbbreviation: 'newProjectAbbreviation',
          })
          proposalStore.createProposal.mockResolvedValueOnce({
            ...proposal,
            projectAbbreviation: 'newProjectAbbreviation',
          })
          const button = getButtonByText('proposal.saveDraft')
          await button.trigger('click')
        })

        it.skipIf(status)('creates the proposal', async () => {
          expect(proposalStore.createProposal).toHaveBeenCalledWith(
            expect.objectContaining({
              status: ProposalStatus.Draft,
              projectAbbreviation: proposal.projectAbbreviation,
            }),
          )
        })

        it.skipIf(!status)('updates the proposal', async () => {
          expect(proposalStore.updateProposal).toHaveBeenCalledWith(
            'proposalId',
            expect.objectContaining({ status, projectAbbreviation: proposal.projectAbbreviation }),
          )
        })

        it('updates the current proposal with the save result', async () => {
          expect(proposalStore.currentProposal?.projectAbbreviation).toBe('newProjectAbbreviation')
        })

        it('shows a success message', async () => {
          expect(showSuccessMessage).toHaveBeenCalledWith('general.savedAsDraft')
        })
      })

      describe('handles submitting', () => {
        beforeEach(() => {
          const button = getButtonByText('proposal.submitApplication')
          button.trigger('click')
          proposalStore.updateProposal.mockResolvedValueOnce({
            ...proposal,
            projectAbbreviation: 'newProjectAbbreviation',
            status: ProposalStatus.FdpgCheck,
          })
          proposalStore.createProposal.mockResolvedValueOnce({
            ...proposal,
            projectAbbreviation: 'newProjectAbbreviation',
            status: ProposalStatus.FdpgCheck,
          })
        })

        beforeEach(() => {
          const termsDialog = wrapper.findComponent({ name: 'TermsDialog' })
          termsDialog.vm.$emit('confirm')
        })

        it.skipIf(status)('creates the proposal', async () => {
          expect(proposalStore.createProposal).toHaveBeenCalledWith(
            expect.objectContaining({
              status: ProposalStatus.FdpgCheck,
              projectAbbreviation: proposal.projectAbbreviation,
            }),
          )
        })

        it.skipIf(!status)('updates the proposal', async () => {
          expect(proposalStore.updateProposal).toHaveBeenCalledWith(
            'proposalId',
            expect.objectContaining({
              status: ProposalStatus.FdpgCheck,
              projectAbbreviation: proposal.projectAbbreviation,
            }),
          )
        })

        it('routes back to the dashboard', () => {
          const router = useRouter()
          expect(router.push).toHaveBeenCalledWith({ name: 'Dashboard' })
        })

        it('shows a success message', async () => {
          expect(showSuccessMessage).toHaveBeenCalledWith('general.savedAsDraft')
        })
      })
    },
  )

  describe('Unhappy paths', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })
    describe('On mounted when the proposal fails to be set', () => {
      beforeEach(() => {
        createTestingPinia()
        proposalStore = vi.mocked(useProposalStore())
        // commentStore = vi.mocked(useCommentStore())
        proposalStore.setCurrentProposal.mockRejectedValueOnce(new Error('error'))
        // commentStore.fetchAll.mockRejectedValueOnce(new Error('error'))
        wrapper = mountComponent(false) as any
      })

      it('shows an error message', async () => {
        expect(showErrorMessage).toHaveBeenCalledTimes(1)
      })

      it('routes back to the dashboard', async () => {
        const router = useRouter()
        expect(router.push).toHaveBeenCalledWith({ name: RouteName.Dashboard })
      })
    })

    describe('On mounted when the comments fail to be loaded', () => {
      beforeEach(() => {
        createTestingPinia()
        proposalStore = vi.mocked(useProposalStore())
        commentStore = vi.mocked(useCommentStore())
        commentStore.fetchAll.mockRejectedValueOnce(new Error('error'))
        wrapper = mountComponent(false) as any
      })

      it('shows an error message', async () => {
        await flushPromises()

        expect(showErrorMessage).toHaveBeenCalledTimes(1)
      })
    })

    describe.each([undefined, 'proposalId'])('Failed to save as draft', (proposalId?: string) => {
      beforeEach(() => {
        createTestingPinia()
        proposalStore = vi.mocked(useProposalStore())
        commentStore = vi.mocked(useCommentStore())
        proposalStore.currentProposal = JSON.parse(
          JSON.stringify({ ...mockProposal, status: ProposalStatus.Draft, _id: proposalId }),
        )
        proposalStore.updateProposal.mockRejectedValueOnce(new Error('error'))
        proposalStore.createProposal.mockRejectedValueOnce(new Error('error'))
        wrapper = mountComponent(false) as any
      })

      it('shows an error message', async () => {
        const button = getButtonByText('proposal.saveDraft')
        await button.trigger('click')
        await flushPromises()
        expect(showErrorMessage).toHaveBeenCalledTimes(1)
      })
    })

    describe.each([undefined, 'proposalId'])('Failed to submit', (proposalId?: string) => {
      beforeEach(() => {
        createTestingPinia()
        proposalStore = vi.mocked(useProposalStore())
        commentStore = vi.mocked(useCommentStore())
        proposalStore.currentProposal = JSON.parse(
          JSON.stringify({ ...mockProposal, status: ProposalStatus.Draft, _id: proposalId }),
        )
        proposalStore.updateProposal.mockRejectedValueOnce(new Error('error'))
        proposalStore.createProposal.mockRejectedValueOnce(new Error('error'))
        wrapper = mountComponent(false) as any
      })

      it('shows an error message', async () => {
        const button = getButtonByText('proposal.submitApplication')
        button.trigger('click')
        const termsDialog = wrapper.findComponent({ name: 'TermsDialog' })
        termsDialog.vm.$emit('confirm')

        await flushPromises()
        expect(showErrorMessage).toHaveBeenCalledTimes(1)
      })
    })

    describe.each([undefined, 'proposalId'])('Failed on validation', (proposalId?: string) => {
      beforeEach(async () => {
        createTestingPinia()
        proposalStore = vi.mocked(useProposalStore())
        commentStore = vi.mocked(useCommentStore())
        proposalStore.currentProposal = JSON.parse(
          JSON.stringify({ ...mockProposal, status: ProposalStatus.Draft, _id: proposalId }),
        )

        wrapper = mountComponent(false) as any
        await flushPromises()
        ;(wrapper.vm as any).formRef = {
          validate: vi.fn().mockImplementation((cb: (isValid: boolean, invalidField: ValidateFieldsError) => void) => {
            cb(false, {
              projectTitle: [
                {
                  message: 'Project title is required',
                  field: 'projectTitle',
                },
              ],
            })
          }),
          validateField: vi
            .fn()
            .mockImplementation(
              (fields: string[], cb: (isValid: boolean, invalidField: ValidateFieldsError) => void) => {
                cb(false, {
                  projectTitle: [
                    {
                      message: 'Project title is required',
                      field: 'projectTitle',
                    },
                  ],
                })
              },
            ),
        }
      })

      it('shows an error message on draft saving', async () => {
        const button = getButtonByText('proposal.saveDraft')
        await button.trigger('click')
        await flushPromises()
        expect(showErrorMessage).toHaveBeenCalledTimes(1)
      })

      it('shows an error message on submit', async () => {
        const button = getButtonByText('proposal.submitApplication')
        button.trigger('click')
        expect(showErrorMessage).toHaveBeenCalledTimes(1)
      })

      it('disables the submit button if it is not valid', async () => {
        const formComponent = wrapper.findComponent({ name: 'ElForm' })
        formComponent.vm.$emit('valid–ate', '', false)
        const button = getButtonByText('proposal.submitApplication')
        expect(button.attributes('ariadisabled')).toBeTruthy()
      })
    })

    describe('Fallback handler for not submitting in invalid status', () => {
      beforeEach(() => {
        wrapper = mountComponent() as any
        proposalStore = vi.mocked(useProposalStore())
        commentStore = vi.mocked(useCommentStore())
        proposalStore.currentProposal = JSON.parse(
          JSON.stringify({ ...mockProposal, status: ProposalStatus.FdpgCheck }),
        )
      })

      it('should do nothing for saving as draft', async () => {
        await wrapper.vm.handleSaveDraft()
        expect(proposalStore.updateProposal).not.toHaveBeenCalled()
        expect(proposalStore.createProposal).not.toHaveBeenCalled()
      })

      it('should do nothing for submitting', async () => {
        await wrapper.vm.handleSubmit()
        expect(wrapper.vm.isTermsDialogOpen).toBeFalsy()
        expect(proposalStore.updateProposal).not.toHaveBeenCalled()
        expect(proposalStore.createProposal).not.toHaveBeenCalled()
      })
    })
  })
})
