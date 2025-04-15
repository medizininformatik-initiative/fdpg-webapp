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
import FdpgFormItem from '@/components/FdpgFormItem.vue'
import { CommentType, type ICommentDetail } from '@/types/comment.interface'
import { mockCommentDetailForTask } from '@/mocks/comment.mock'
import { useLayoutStore } from '@/stores/layout.store'
import { CreatPrposalSteps } from '@/types/create-proposal-steps.enum'

vi.mock('@/validations', () => ({
  checkValueShouldBeTrue: vi.fn().mockReturnValue({ validator: (_rule: any, _value: any, cb: any) => cb() }),
  maxLengthValidationFunc: vi.fn().mockReturnValue({ validator: (_rule: any, _value: any, cb: any) => cb() }),
  numberValidationFunc: vi.fn().mockReturnValue({ validator: (_rule: any, _value: any, cb: any) => cb() }),
  projectAbbreviationValidationFunc: vi.fn().mockReturnValue({ validator: (_rule: any, _value: any, cb: any) => cb() }),
  requiredIfEmptyValidationFunc: vi.fn().mockReturnValue({ validator: (_rule: any, _value: any, cb: any) => cb() }),
  requiredUploadFunc: vi.fn().mockReturnValue({ validator: (_rule: any, _value: any, cb: any) => cb() }),
  requiredValidationFunc: vi.fn().mockReturnValue({ validator: (_rule: any, _value: any, cb: any) => cb() }),
  specialCharactersValidationFunc: vi.fn().mockReturnValue({ validator: (_rule: any, _value: any, cb: any) => cb() }),
  startDateInPastValidationFunc: vi.fn().mockReturnValue({ validator: (_rule: any, _value: any, cb: any) => cb() }),
}))

vi.mock('vue-i18n', () => ({
  createI18n: vi.fn(),
  useI18n: vi.fn().mockImplementation(() => ({
    t: vi.fn().mockImplementation((key: string) => key),
  })),
  i18n: {
    global: {
      t: vi.fn().mockImplementation((entry) => entry),
    },
  },
}))

vi.mock('@/plugins/i18n', () => ({
  i18n: {
    global: {
      t: vi.fn().mockImplementation((entry) => entry),
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

const mountComponent = (withPinia = true) => {
  const plugins: any[] = withPinia
    ? [
        createTestingPinia({
          createSpy: vi.fn,
          initialState: {
            layout: {
              activeStep: CreatPrposalSteps.ResearchProject,
            },
          },
        }),
      ]
    : []
  return shallowMount(NewPage, {
    global: {
      plugins,
      stubs: {
        'el-container': false,
        'el-form': false,
        'el-row': false,
        'el-col': false,
        'el-button': false,
        'el-card': false,
        'el-form-item': false,
      },
      mocks: {
        params: { id: 'proposalId' }, // Mock router params
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
  allFieldsValid: boolean
  isValidToSubmit: boolean
}

describe('Newpage.vue', () => {
  let wrapper: ReturnType<typeof mountComponent> & { vm: VmType }
  let proposalStore: MockedObject<ReturnType<typeof useProposalStore>>
  let commentStore: MockedObject<ReturnType<typeof useCommentStore>>
  let layoutStore: MockedObject<ReturnType<typeof useLayoutStore>>

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

    beforeEach(() => {
      vi.clearAllMocks()
      vi.spyOn(document, 'getElementById').mockReturnValue(anchorMock as any)

      proposal = JSON.parse(JSON.stringify(mockProposal))
      wrapper = mountComponent() as any
      proposalStore = vi.mocked(useProposalStore())
      commentStore = vi.mocked(useCommentStore())
      layoutStore = vi.mocked(useLayoutStore())
      proposalStore.currentProposal = proposal

      // Ensure we're in the right step
      layoutStore.activeStep = CreatPrposalSteps.ResearchProject
    })

    it('renders', () => {
      expect(wrapper).toBeTruthy()
    })

    it('sets the currentProposal', () => {
      expect(proposalStore.setCurrentProposal).toHaveBeenCalledWith('proposalId')
    })

    it('fetches the comments', async () => {
      vi.spyOn(commentStore, 'fetchAll').mockResolvedValue()
      await wrapper.vm.$nextTick()

      expect(commentStore.fetchAll).toHaveBeenCalledWith({ proposalId: 'proposalId' })
    })

    it('scrolls to the anchor', async () => {
      await flushPromises()
      expect(anchorMock.scrollIntoView).toHaveBeenCalledWith({ block: 'start', behavior: 'smooth' })
    })

    it('navigates to the detail page on detail button press', async () => {
      const router = useRouter()
      const button = wrapper.find('[data-test-id="projectDetails"]')
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
        layoutStore = vi.mocked(useLayoutStore())
        proposalStore.currentProposal = proposal

        // Ensure we're in the right step
        layoutStore.activeStep = CreatPrposalSteps.ResearchProject
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

          // Directly call the method instead of clicking the button
          await wrapper.vm.handleSaveDraft()

          // Ensure all promises resolve
          await flushPromises()
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
          expect(showSuccessMessage).toHaveBeenCalled()
        })
      })

      describe('handles submitting', () => {
        beforeEach(async () => {
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

          // Directly call handleSubmit and ensure dialog is handled
          wrapper.vm.isTermsDialogOpen = true
          await wrapper.vm.$nextTick()

          // Simulate confirming terms
          const termsDialog = wrapper.findComponent({ name: 'TermsDialog' })
          termsDialog.vm.$emit('confirm')

          // Ensure all promises resolve
          await flushPromises()
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
          expect(showSuccessMessage).toHaveBeenCalled()
        })

        it('disables the submit button if it is not valid', async () => {
          wrapper.vm.allFieldsValid = false
          await wrapper.vm.$nextTick()

          const formComponent = wrapper.findComponent({ name: 'ElForm' })
          await formComponent.vm.$emit('validate', '', false)
          await wrapper.vm.$nextTick() // Wait for state updates

          const button = wrapper.find('[data-test-id="handleSubmit"]')
          expect(button.attributes('aria-disabled')).toBe('true')
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
        const button = wrapper.find('[data-test-id="saveDraft"]')
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
        const layoutStore = useLayoutStore()
        layoutStore.activeStep = CreatPrposalSteps.ResearchProject

        await wrapper.vm.$nextTick()

        const button = wrapper.find('[data-test-id="handleSubmit"]')
        button.trigger('click')

        // Wait for dialog to open
        await wrapper.vm.$nextTick()

        // Simulate clicking confirm on terms dialog
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
        const button = wrapper.find('[data-test-id="saveDraft"]')
        await button.trigger('click')
        await flushPromises()
        expect(showErrorMessage).toHaveBeenCalledTimes(1)
      })

      it('shows an error message on submit', async () => {
        wrapper.vm.isValidToSubmit = true

        // Get the layoutStore and set the activeStep
        const layoutStore = useLayoutStore()
        layoutStore.activeStep = CreatPrposalSteps.ResearchProject

        await wrapper.vm.$nextTick()

        const button = wrapper.find('[data-test-id="handleSubmit"]')
        expect(button.attributes('disabled')).toBeUndefined()
        button.trigger('click')
        expect(showErrorMessage).toHaveBeenCalledTimes(1)
      })

      it('disables the submit button if it is not valid', async () => {
        const layoutStore = useLayoutStore()
        layoutStore.activeStep = CreatPrposalSteps.ResearchProject

        await wrapper.vm.$nextTick()
        wrapper.vm.allFieldsValid = false
        await wrapper.vm.$nextTick()

        const formComponent = wrapper.findComponent({ name: 'ElForm' })
        await formComponent.vm.$emit('validate', '', false)
        await wrapper.vm.$nextTick() // Wait for state updates
        const button = wrapper.find('[data-test-id="handleSubmit"]')
        expect(button.attributes('aria-disabled')).toBe('true')
      })

      it('disables the submit button if theres no id set', async () => {
        const layoutStore = useLayoutStore()
        layoutStore.activeStep = CreatPrposalSteps.ResearchProject

        await wrapper.vm.$nextTick()
        const formComponent = wrapper.findComponent({ name: 'ElForm' })
        await formComponent.vm.$emit('validate', '', false)
        await wrapper.vm.$nextTick() // Wait for state updates

        wrapper.vm.allFieldsValid = true
        await wrapper.vm.$nextTick()

        const button = wrapper.find('[data-test-id="handleSubmit"]')
        expect(button.attributes('aria-disabled')).toBe(proposalId ? 'false' : 'true')
      })
    })
    describe('Submit button behavior', () => {
      let proposal: IProposal
      let layoutStore: MockedObject<ReturnType<typeof useLayoutStore>>

      beforeEach(async () => {
        createTestingPinia({
          createSpy: vi.fn,
          initialState: {
            layout: {
              activeStep: CreatPrposalSteps.ResearchProject,
            },
          },
        })
        proposal = JSON.parse(JSON.stringify(mockProposal))
        proposalStore = vi.mocked(useProposalStore())
        commentStore = vi.mocked(useCommentStore())
        layoutStore = vi.mocked(useLayoutStore())
        proposalStore.currentProposal = proposal
        proposalStore.currentProposal.status = ProposalStatus.Rework
        commentStore.comments = [
          {
            ...mockCommentDetailForTask,
          } as ICommentDetail,
        ]
        wrapper = mountComponent(false) as any
        wrapper.vm.allFieldsValid = true

        // Ensure we're in the right step
        layoutStore.activeStep = CreatPrposalSteps.ResearchProject
      })

      it('disables the submit button if there are open tasks', async () => {
        await flushPromises()

        const button = wrapper.find('[data-test-id="handleSubmit"]')

        expect(button.attributes('aria-disabled')).toBe('true')
      })

      it('enables the submit button if there are no open tasks', async () => {
        commentStore.comments = [
          {
            ...mockCommentDetailForTask,
            isDone: true,
          } as ICommentDetail,
        ]
        const OpenProposalTasks = () => {
          return commentStore.comments
            .filter((comment: ICommentDetail) => comment.type === CommentType.PROPOSAL_TASK)
            .filter((task: ICommentDetail) => !task.isDone)
        }
        const hasOpenTasks =
          OpenProposalTasks.length > 0 && proposalStore.currentProposal?.status === ProposalStatus.Rework

        await flushPromises()

        const button = wrapper.find('[data-test-id="handleSubmit"]')
        // Assert that the button is enabled
        expect(button.attributes('aria-disabled')).toBe('false')
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
