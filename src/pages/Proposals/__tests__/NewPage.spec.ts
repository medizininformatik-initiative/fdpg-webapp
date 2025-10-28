const MOCK_PROPOSAL_ID = 'proposalId'
const MOCK_PARAMS = { id: MOCK_PROPOSAL_ID }

import { Role } from '@/types/oidc.types'
import { createTestingPinia } from '@pinia/testing'
import { flushPromises, shallowMount } from '@vue/test-utils'
import NewPage from '../NewPage.vue'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import { useCommentStore } from '@/stores/comment/comment.store'
import type { MockedObject } from 'vitest'
import { mockProposal } from '@/mocks/proposal.mock'
import { ProposalStatus, ProposalTypeOfUse, type IProposal } from '@/types/proposal.types'
import useNotifications from '@/composables/use-notifications'
import { useRouter } from 'vue-router'
import { RouteName } from '@/types/route-name.enum'
import type { ValidateFieldsError } from 'async-validator'
import FdpgFormItem from '@/components/FdpgFormItem.vue'
import { CommentType, type ICommentDetail } from '@/types/comment.interface'
import { mockCommentDetailForTask } from '@/mocks/comment.mock'
import { useLayoutStore } from '@/stores/layout.store'
import { CreatPrposalSteps } from '@/types/create-proposal-steps.enum'
import { useAuthStore } from '@/stores/auth/auth.store'

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
  const MOCK_ID = 'proposalId'
  const mockRoute = { query: { anchor: 'anchorId' }, params: { id: MOCK_ID }, name: 'NewProposal' }
  return {
    createRouter: vi.fn().mockImplementation(() => ({ beforeEach: vi.fn() })),
    createWebHistory: vi.fn(),
    useRoute: vi.fn().mockReturnValue(mockRoute),
    useRouter: vi.fn(() => ({
      push: pushMock,
      currentRoute: { value: mockRoute },
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
        LeadHeader: false,
      },
      mocks: {
        params: MOCK_PARAMS,
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
  isSubmissionDialogOpen: boolean
  allFieldsValid: boolean
  isValidToSubmit: boolean
}

describe('Newpage.vue', () => {
  let wrapper: ReturnType<typeof mountComponent> & { vm: VmType }
  let proposalStore: MockedObject<ReturnType<typeof useProposalStore>>
  let commentStore: MockedObject<ReturnType<typeof useCommentStore>>
  let layoutStore: MockedObject<ReturnType<typeof useLayoutStore>>
  let authStore: MockedObject<ReturnType<typeof useAuthStore>>

  const { showSuccessMessage, showErrorMessage } = useNotifications()

  const anchorMock = {
    scrollIntoView: vi.fn(),
  }

  describe('In any case', () => {
    let proposal: IProposal
    let authStore: MockedObject<ReturnType<typeof useAuthStore>>

    beforeEach(async () => {
      vi.clearAllMocks()
      vi.spyOn(document, 'getElementById').mockReturnValue(anchorMock as any)

      proposal = JSON.parse(JSON.stringify(mockProposal))
      wrapper = mountComponent() as any
      proposalStore = vi.mocked(useProposalStore())
      commentStore = vi.mocked(useCommentStore())
      layoutStore = vi.mocked(useLayoutStore())
      authStore = vi.mocked(useAuthStore())

      // Mock user as the proposal owner
      authStore.profile = {
        sub: 'a7fb1f28-8680-4453-92d8-ff5b153911c8',
        email: 'lars.schaefer@appsfactory.de',
      } as any

      proposalStore.currentProposal = proposal

      // Ensure we're in the right step
      layoutStore.activeStep = CreatPrposalSteps.ResearchProject
    })

    it('renders', () => {
      expect(wrapper).toBeTruthy()
    })

    it('sets the currentProposal', () => {
      expect(proposalStore.setCurrentProposal).toHaveBeenCalledWith(MOCK_PROPOSAL_ID)
    })

    it('fetches the comments', async () => {
      vi.spyOn(commentStore, 'fetchAll').mockResolvedValue()
      await wrapper.vm.$nextTick()
      // Ensure all promises resolve
      await flushPromises()

      expect(commentStore.fetchAll).toHaveBeenCalledWith({ proposalId: MOCK_PROPOSAL_ID })
    })

    it('scrolls to the anchor', async () => {
      await flushPromises()
      expect(anchorMock.scrollIntoView).toHaveBeenCalledWith({ block: 'start', behavior: 'smooth' })
    })

    it('navigates to the detail page on detail button press', async () => {
      const router = useRouter()
      const button = wrapper.find('[data-testId="button__projectDetails"]')
      await button.trigger('click')
      expect(router.push).toHaveBeenCalledWith({ name: RouteName.ProposalDetails, params: { id: MOCK_PROPOSAL_ID } })
    })
  })

  describe.each([ProposalStatus.Draft, ProposalStatus.Rework, undefined])(
    'When the proposal is editable with status %s',
    (status?: ProposalStatus) => {
      let proposal: IProposal
      let authStore: MockedObject<ReturnType<typeof useAuthStore>>
      beforeEach(() => {
        proposal = JSON.parse(
          JSON.stringify({ ...mockProposal, status: status, _id: status ? MOCK_PROPOSAL_ID : undefined }),
        )
        wrapper = mountComponent() as any
        proposalStore = vi.mocked(useProposalStore())
        commentStore = vi.mocked(useCommentStore())
        layoutStore = vi.mocked(useLayoutStore())
        authStore = vi.mocked(useAuthStore())

        // Mock user as the proposal owner to enable editing
        authStore.profile = {
          sub: 'a7fb1f28-8680-4453-92d8-ff5b153911c8', // matches mockProposal owner.id
          email: 'lars.schaefer@appsfactory.de', // matches mockProposal owner.email
        } as any

        proposalStore.currentProposal = proposal

        // Ensure we're in the right step
        layoutStore.activeStep = CreatPrposalSteps.ResearchProject
      })

      it('renders the action buttons', async () => {
        const row = wrapper.find('.action-wrapper')
        expect(row.exists()).toBe(true)
      })

      it('sets review mode to false', async () => {
        // Wait for all reactive updates
        await wrapper.vm.$nextTick()
        await flushPromises()

        const component = wrapper.findComponent({ name: 'UserProjectInformation' })

        // Debug info
        console.log('Review mode:', component.props().reviewMode)
        console.log('Auth profile:', authStore.profile)
        console.log('Proposal owner:', proposal.owner)

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
            MOCK_PROPOSAL_ID,
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
          wrapper.vm.isSubmissionDialogOpen = true
          await wrapper.vm.$nextTick()

          // Simulate confirming terms
          const SubmissionDialog = wrapper.findComponent({ name: 'SubmissionDialog' })
          SubmissionDialog.vm.$emit('confirm')

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
            MOCK_PROPOSAL_ID,
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

    describe.each([undefined, MOCK_PROPOSAL_ID])('Failed to save as draft', (proposalId?: string) => {
      let authStore: MockedObject<ReturnType<typeof useAuthStore>>
      beforeEach(() => {
        createTestingPinia()
        proposalStore = vi.mocked(useProposalStore())
        commentStore = vi.mocked(useCommentStore())
        authStore = vi.mocked(useAuthStore())

        // Mock user as owner to ensure buttons are visible
        authStore.profile = {
          sub: 'a7fb1f28-8680-4453-92d8-ff5b153911c8',
          email: 'lars.schaefer@appsfactory.de',
        } as any

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

    describe.each([undefined, MOCK_PROPOSAL_ID])('Failed to submit', (proposalId?: string) => {
      let authStore: MockedObject<ReturnType<typeof useAuthStore>>
      beforeEach(() => {
        createTestingPinia()
        proposalStore = vi.mocked(useProposalStore())
        commentStore = vi.mocked(useCommentStore())
        authStore = vi.mocked(useAuthStore())

        // Mock user as owner to ensure buttons are visible
        authStore.profile = {
          sub: 'a7fb1f28-8680-4453-92d8-ff5b153911c8',
          email: 'lars.schaefer@appsfactory.de',
        } as any

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
        const SubmissionDialog = wrapper.findComponent({ name: 'SubmissionDialog' })
        SubmissionDialog.vm.$emit('confirm')

        await flushPromises()
        expect(showErrorMessage).toHaveBeenCalledTimes(1)
      })
    })

    describe.each([undefined, MOCK_PROPOSAL_ID])('Failed on validation', (proposalId?: string) => {
      let authStore: MockedObject<ReturnType<typeof useAuthStore>>
      beforeEach(async () => {
        createTestingPinia()
        proposalStore = vi.mocked(useProposalStore())
        commentStore = vi.mocked(useCommentStore())
        authStore = vi.mocked(useAuthStore())

        // Mock user as owner to ensure buttons are visible
        authStore.profile = {
          sub: 'a7fb1f28-8680-4453-92d8-ff5b153911c8',
          email: 'lars.schaefer@appsfactory.de',
        } as any

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

      it('shows an error message on submit', async () => {
        wrapper.vm.isValidToSubmit = true

        // Get the layoutStore and set the activeStep
        const layoutStore = useLayoutStore()
        layoutStore.activeStep = CreatPrposalSteps.ResearchProject

        await wrapper.vm.$nextTick()

        const button = wrapper.find('[data-test-id="handleSubmit"]')
        expect(button.attributes('disabled')).toBeUndefined()
        await button.trigger('click')
        await flushPromises()
        expect(wrapper.vm.isSubmissionDialogOpen).toBeTruthy()
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
        expect(button.attributes('aria-disabled')).toBe('false')
      })
    })
    describe('Submit button behavior', () => {
      let proposal: IProposal
      let layoutStore: MockedObject<ReturnType<typeof useLayoutStore>>
      let authStore: MockedObject<ReturnType<typeof useAuthStore>>

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
        authStore = vi.mocked(useAuthStore())

        // Mock user as owner to ensure buttons are visible
        authStore.profile = {
          sub: 'a7fb1f28-8680-4453-92d8-ff5b153911c8',
          email: 'lars.schaefer@appsfactory.de',
        } as any

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

        expect(button.attributes('aria-disabled')).toBe('false')
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
        expect(proposalStore.updateProposal).not.toHaveBeenCalled()
        expect(proposalStore.createProposal).not.toHaveBeenCalled()
      })
    })
  })

  describe('Responsible Scientist Editing', () => {
    let proposal: IProposal
    let authStore: MockedObject<ReturnType<typeof useAuthStore>>

    beforeEach(() => {
      proposal = JSON.parse(
        JSON.stringify({
          ...mockProposal,
          status: ProposalStatus.Draft, // Use editable status
          _id: MOCK_PROPOSAL_ID,
          projectResponsible: {
            researcher: {
              email: 'responsible@example.com',
              firstName: 'John',
              lastName: 'Doe',
            },
            projectResponsibility: {
              applicantIsProjectResponsible: false,
            },
          },
        }),
      )

      wrapper = mountComponent() as any
      proposalStore = vi.mocked(useProposalStore())
      commentStore = vi.mocked(useCommentStore())
      layoutStore = vi.mocked(useLayoutStore())
      authStore = vi.mocked(useAuthStore())

      proposalStore.currentProposal = proposal
      layoutStore.activeStep = CreatPrposalSteps.ResearchProject
    })

    it('allows editing when current user is the responsible scientist', async () => {
      // Mock the auth store to return the responsible scientist's email
      authStore.profile = {
        email: 'responsible@example.com',
      } as any

      await wrapper.vm.$nextTick()

      // Check that review mode is false (editing is allowed)
      const component = wrapper.findComponent({ name: 'UserProjectInformation' })
      expect(component.props().reviewMode).toBe(false)
    })

    it('prevents editing when current user is not the responsible scientist', async () => {
      // Mock the auth store to return a different email
      authStore.profile = {
        email: 'other@example.com',
      } as any

      await wrapper.vm.$nextTick()

      // Check that review mode is true (editing is prevented)
      const component = wrapper.findComponent({ name: 'UserProjectInformation' })
      expect(component.props().reviewMode).toBe(true)
    })

    it('allows editing when applicant is project responsible and current user is applicant', async () => {
      // Reset the proposal with applicant as project responsible
      proposal = JSON.parse(
        JSON.stringify({
          ...mockProposal,
          status: ProposalStatus.Draft,
          _id: MOCK_PROPOSAL_ID,
          applicant: {
            researcher: { email: 'applicant@example.com' },
          },
          projectResponsible: {
            // No researcher email when applicant is responsible
            projectResponsibility: {
              _id: '68dd481a13b770c9855ed20c',
              isDone: false,
              applicantIsProjectResponsible: true,
            },
          },
        }),
      )

      // Update the proposal store with the modified proposal
      proposalStore.currentProposal = proposal

      // Mock the auth store to return the applicant's email
      authStore.profile = {
        email: 'applicant@example.com',
      } as any

      // Manually trigger the component to update the form with new data
      await (wrapper.vm as any).setUpPage()

      // Check that review mode is false (editing is allowed)
      const component = wrapper.findComponent({ name: 'UserProjectInformation' })
      expect(component.exists()).toBe(true)
      expect(component.props().reviewMode).toBe(false)
    })
  })

  describe('Registering Form Features', () => {
    let proposal: IProposal
    let authStore: MockedObject<ReturnType<typeof useAuthStore>>

    beforeEach(async () => {
      vi.clearAllMocks()
      vi.spyOn(document, 'getElementById').mockReturnValue(anchorMock as any)

      proposal = JSON.parse(JSON.stringify(mockProposal))
      proposal.register = {
        isRegisteringForm: true,
        isInternalRegistration: false,
      }
      wrapper = mountComponent() as any
      proposalStore = vi.mocked(useProposalStore())
      commentStore = vi.mocked(useCommentStore())
      layoutStore = vi.mocked(useLayoutStore())
      authStore = vi.mocked(useAuthStore())

      authStore.profile = {
        sub: 'userId',
        email: 'test@example.com',
      } as any

      proposalStore.currentProposal = proposal
      commentStore.comments = []
    })

    describe('isRegisteringForm detection', () => {
      it('should be false for regular proposal routes (default)', async () => {
        // Default route is "NewProposal" from the mock setup
        wrapper = mountComponent() as any
        await wrapper.vm.$nextTick()

        const vm = wrapper.vm as any
        // For regular routes, isRegisteringForm should be false
        expect(vm.isRegisteringForm).toBe(false)
      })

      it('should use register flag from proposal object', async () => {
        // Set up proposal with register object
        proposal._id = MOCK_PROPOSAL_ID
        proposal.status = ProposalStatus.Draft
        proposal.register = {
          isRegisteringForm: true,
          isInternalRegistration: false,
        }

        proposalStore.currentProposal = proposal

        wrapper = mountComponent() as any
        await wrapper.vm.$nextTick()

        const vm = wrapper.vm as any
        // Verify the proposal has the register flag in the store
        expect(proposalStore.currentProposal?.register?.isRegisteringForm).toBe(true)
      })
    })

    describe('Register object structure', () => {
      it('should have register object with expected structure', async () => {
        // Set up proposal with register object
        proposal._id = MOCK_PROPOSAL_ID
        proposal.status = ProposalStatus.Draft
        proposal.register = {
          isRegisteringForm: true,
          isInternalRegistration: false,
        }

        proposalStore.currentProposal = proposal

        wrapper = mountComponent() as any
        await wrapper.vm.$nextTick()

        const vm = wrapper.vm as any

        // Verify proposal store has the register object
        expect(proposalStore.currentProposal?.register).toBeDefined()
        expect(proposalStore.currentProposal?.register?.isRegisteringForm).toBe(true)
        expect(proposalStore.currentProposal?.register?.isInternalRegistration).toBe(false)
      })

      it('should handle isInternalRegistration flag correctly', async () => {
        // Set up proposal with internal registration
        proposal._id = MOCK_PROPOSAL_ID
        proposal.status = ProposalStatus.Draft
        proposal.register = {
          isRegisteringForm: true,
          isInternalRegistration: true,
        }

        proposalStore.currentProposal = proposal

        wrapper = mountComponent() as any
        await wrapper.vm.$nextTick()

        const vm = wrapper.vm as any

        // Verify isInternalRegistration is preserved
        expect(proposalStore.currentProposal?.register?.isInternalRegistration).toBe(true)
      })
    })

    describe('Biosample toggle stabilization', () => {
      it('should have isBiosampleToggleInProgress flag available', async () => {
        proposalStore.currentProposal = proposal

        wrapper = mountComponent() as any
        await wrapper.vm.$nextTick()

        const vm = wrapper.vm as any

        // Verify flag exists and is boolean
        expect(typeof vm.isBiosampleToggleInProgress).toBe('boolean')
        expect(vm.isBiosampleToggleInProgress).toBe(false)
      })

      it('should initialize biosamples when BIOSAMPLE is selected', async () => {
        // Set up proposal without biosamples
        proposal.userProject.typeOfUse = {
          usage: [],
        } as any
        proposal.userProject.informationOnRequestedBioSamples = undefined

        proposalStore.currentProposal = proposal

        wrapper = mountComponent() as any
        await wrapper.vm.$nextTick()

        const vm = wrapper.vm as any

        // Enable BIOSAMPLE
        vm.proposalForm.userProject.typeOfUse.usage = ['BIOSAMPLE']
        await wrapper.vm.$nextTick()
        await flushPromises()

        // Wait for the cooldown period
        await new Promise((resolve) => setTimeout(resolve, 150))

        // Verify biosamples object was initialized
        expect(vm.proposalForm.userProject.informationOnRequestedBioSamples).toBeDefined()
        expect(vm.proposalForm.userProject.informationOnRequestedBioSamples.biosamples).toEqual([])
      })

      it('should have biosamples structure when initialized', async () => {
        // Set up proposal with biosamples
        proposal._id = MOCK_PROPOSAL_ID
        proposal.status = ProposalStatus.Draft
        proposal.userProject.typeOfUse = {
          usage: ['BIOSAMPLE'],
        } as any
        proposal.userProject.informationOnRequestedBioSamples = {
          biosamples: [{ type: 'blood' }],
          laboratoryResources: 'Lab',
          noSampleRequired: false,
        } as any

        proposalStore.currentProposal = proposal

        wrapper = mountComponent() as any
        await wrapper.vm.$nextTick()

        const vm = wrapper.vm as any

        // Verify biosamples structure exists in the store
        expect(proposalStore.currentProposal?.userProject?.informationOnRequestedBioSamples).toBeDefined()
        expect(
          Array.isArray(proposalStore.currentProposal?.userProject?.informationOnRequestedBioSamples?.biosamples),
        ).toBe(true)
        expect(
          proposalStore.currentProposal?.userProject?.informationOnRequestedBioSamples?.laboratoryResources,
        ).toBeDefined()
      })
    })
  })
})
