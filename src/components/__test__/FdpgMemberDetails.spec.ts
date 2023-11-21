import useNotifications from '@/composables/use-notifications'
import { mockProposal } from '@/mocks/proposal.mock'
import { useCommentStore } from '@/stores/comment/comment.store'
import { useMessageBoxStore, type IMessageBox } from '@/stores/messageBox.store'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import type { IButtonConfig } from '@/types/button-config.interface'
import { ProposalStatus, type IProposal } from '@/types/proposal.types'
import { RouteName } from '@/types/route-name.enum'
import { createTestingPinia } from '@pinia/testing'
import { flushPromises, shallowMount } from '@vue/test-utils'
import type { MockedObject } from 'vitest'
import { useRouter } from 'vue-router'
import FdpgMemberDetails from '../Proposals/Details/FdpgMemberDetails.vue'
import { useAuthStore } from '@/stores/auth/auth.store'
import { Role } from '@/types/oidc.types'
import type { IDetailActionRow } from '@/types/detail-action-row.interface'
import { useLayoutStore } from '@/stores/layout.store'
import type { UploadFile } from 'element-plus'
import type { MiiLocation } from '@/types/location.enum'

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

const mountComponent = (withPinia = true) => {
  const plugins: any[] = withPinia ? [createTestingPinia()] : []
  return shallowMount(FdpgMemberDetails, {
    global: {
      plugins,
      stubs: {
        'el-container': false,
      },
    },
    props: {},
  })
}

describe('FdpgMemberDetails', () => {
  let wrapper: ReturnType<typeof mountComponent>
  let proposalStore: MockedObject<ReturnType<typeof useProposalStore>>
  let commentStore: MockedObject<ReturnType<typeof useCommentStore>>
  let messageBoxStore: MockedObject<ReturnType<typeof useMessageBoxStore>>
  let authStore: MockedObject<ReturnType<typeof useAuthStore>>
  let layoutStore: MockedObject<ReturnType<typeof useLayoutStore>>

  const { showSuccessMessage, showErrorMessage } = useNotifications()

  let proposal: IProposal

  beforeEach(() => {
    vi.clearAllMocks()

    createTestingPinia()
    proposal = JSON.parse(JSON.stringify(mockProposal))
    proposalStore = vi.mocked(useProposalStore())
    commentStore = vi.mocked(useCommentStore())
    messageBoxStore = vi.mocked(useMessageBoxStore())
    authStore = vi.mocked(useAuthStore())
    layoutStore = vi.mocked(useLayoutStore())
    proposalStore.setCurrentProposal.mockResolvedValueOnce(proposal)
    proposalStore.currentProposal = proposal

    wrapper = mountComponent(false) as any
  })

  describe('In any case', () => {
    let proposal: IProposal
    const router = useRouter()

    it('renders', () => {
      expect(wrapper).toBeTruthy()
    })

    beforeEach(() => {
      vi.clearAllMocks()

      createTestingPinia()
      proposal = JSON.parse(JSON.stringify(mockProposal))

      proposalStore = vi.mocked(useProposalStore())
      commentStore = vi.mocked(useCommentStore())
      messageBoxStore = vi.mocked(useMessageBoxStore())
      authStore = vi.mocked(useAuthStore())
      layoutStore = vi.mocked(useLayoutStore())
      proposalStore.currentProposal = proposal
      proposalStore.setCurrentProposal.mockResolvedValueOnce(proposal)

      messageBoxStore.setMessageBoxInfo.mockImplementationOnce(async (config: IMessageBox) => {
        config.callback('confirm')
      })

      wrapper = mountComponent(false) as any
    })

    it('sets the currentProposal', () => {
      expect(proposalStore.setCurrentProposal).toHaveBeenCalledWith('proposalId')
    })

    describe('Handling of top bar buttons', () => {
      it('exports the proposal', async () => {
        proposalStore.currentProposal!.status = ProposalStatus.FdpgCheck

        const detailTopBar = wrapper.findComponent({ name: 'DetailTopBar' })
        const buttonProps = detailTopBar.props('buttons') as IButtonConfig[]
        const openButton = buttonProps.find((button) => button.label === 'proposal.exportPdfProposal')
        await openButton?.action()

        expect(proposalStore.getProposalFile).toHaveBeenCalledWith('proposalId')
      })
      it('opens the proposal', () => {
        const router = useRouter()
        const detailTopBar = wrapper.findComponent({ name: 'DetailTopBar' })
        const buttonProps = detailTopBar.props('buttons') as IButtonConfig[]
        const openButton = buttonProps.find((button) => button.label === 'proposal.toTheRequest')
        openButton?.action()

        expect(router.push).toHaveBeenCalledWith({ name: RouteName.ReviewProposal, params: { id: 'proposalId' } })
      })

      it('archives the proposal', async () => {
        const { showSuccessMessage, showErrorMessage } = useNotifications()

        proposalStore.currentProposal!.status = ProposalStatus.ReadyToArchive

        const detailTopBar = wrapper.findComponent({ name: 'DetailTopBar' })
        const buttonProps = detailTopBar.props('buttons') as IButtonConfig[]
        const openButton = buttonProps.find((button) => button.label === 'proposal.archiveProject')
        await openButton?.action()

        expect(showSuccessMessage).toHaveBeenCalledWith('general.submitted')
        expect(router.push).toHaveBeenCalledWith({ name: RouteName.Dashboard })
      })

      it('locks the proposal', async () => {
        const { showSuccessMessage, showErrorMessage } = useNotifications()

        authStore.singleKnownRole = Role.FdpgMember

        const detailTopBar = wrapper.findComponent({ name: 'DetailTopBar' })
        const buttonProps = detailTopBar.props('buttons') as IButtonConfig[]
        const openButton = buttonProps.find((button) => button.label === 'proposal.lockProposal')
        await openButton?.action()

        expect(proposalStore.updateLockingState).toHaveBeenCalledWith('proposalId', true)
        expect(showSuccessMessage).toHaveBeenCalledWith('general.submitted')
        expect(router.push).toHaveBeenCalledWith({ name: RouteName.Dashboard })
      })
    })

    describe('Handling of action buttons', () => {
      it('rejects the proposal', async () => {
        proposalStore.currentProposal!.status = ProposalStatus.FdpgCheck
        layoutStore.lastDashboard = RouteName.Dashboard

        const actionRow = wrapper.findComponent({ name: 'DetailActionRow' })
        const buttonProps = actionRow.props('buttons') as IDetailActionRow[]
        const openButton = buttonProps.find((button) => button.label === 'proposal.rejectApplication')
        await openButton?.action()

        expect(proposalStore.updateProposalStatus).toHaveBeenCalledWith('proposalId', ProposalStatus.Rejected)
        expect(showSuccessMessage).toHaveBeenCalledWith('general.submitted')
        expect(router.push).toHaveBeenCalledWith({ name: layoutStore.lastDashboard })
      })

      it('requests revision', async () => {
        proposalStore.currentProposal!.status = ProposalStatus.FdpgCheck
        layoutStore.lastDashboard = RouteName.Dashboard

        const actionRow = wrapper.findComponent({ name: 'DetailActionRow' })
        const buttonProps = actionRow.props('buttons') as IDetailActionRow[]
        const openButton = buttonProps.find((button) => button.label === 'proposal.requestRevision')
        await openButton?.action()

        expect(proposalStore.updateProposalStatus).toHaveBeenCalledWith('proposalId', ProposalStatus.Rework)
        expect(showSuccessMessage).toHaveBeenCalledWith('general.submitted')
        expect(router.push).toHaveBeenCalledWith({ name: layoutStore.lastDashboard })
      })

      it('forwards to location check', async () => {
        proposalStore.currentProposal!.status = ProposalStatus.FdpgCheck
        layoutStore.lastDashboard = RouteName.Dashboard

        const actionRow = wrapper.findComponent({ name: 'DetailActionRow' })
        const buttonProps = actionRow.props('buttons') as IDetailActionRow[]
        const openButton = buttonProps.find((button) => button.label === 'proposal.toLocationCheck')
        await openButton?.action()

        expect(proposalStore.updateProposalStatus).toHaveBeenCalledWith('proposalId', ProposalStatus.LocationCheck)
        expect(showSuccessMessage).toHaveBeenCalledWith('general.submitted')
        expect(router.push).toHaveBeenCalledWith({ name: layoutStore.lastDashboard })
      })

      it('initiates contracting', async () => {
        proposalStore.currentProposal!.status = ProposalStatus.LocationCheck
        layoutStore.lastDashboard = RouteName.Dashboard

        const contractFile = { raw: { fileName: 'test.pdf' } } as any as UploadFile

        const actionRow = wrapper.findComponent({ name: 'DetailActionRow' })
        const buttonProps = actionRow.props('buttons') as IDetailActionRow[]
        const openButton = buttonProps.find((button) => button.label === 'proposal.initiateContract')
        await openButton?.action()

        const contractDialog = wrapper.findComponent({ name: 'InitiateContractDialog' })

        expect(contractDialog.exists()).toBeTruthy()

        contractDialog.vm.$emit('initiate-contract', contractFile, ['MRI', 'KC'] as MiiLocation[])
        await flushPromises()

        expect(proposalStore.initContracting).toHaveBeenCalledWith('proposalId', contractFile.raw, [
          'MRI',
          'KC',
        ] as MiiLocation[])
        expect(showSuccessMessage).toHaveBeenCalledWith('general.submitted')
        expect(router.push).toHaveBeenCalledWith({ name: layoutStore.lastDashboard })
      })

      it('forwards to expect data delivery', async () => {
        proposalStore.currentProposal!.status = ProposalStatus.Contracting
        layoutStore.lastDashboard = RouteName.Dashboard

        const actionRow = wrapper.findComponent({ name: 'DetailActionRow' })
        const buttonProps = actionRow.props('buttons') as IDetailActionRow[]
        const openButton = buttonProps.find((button) => button.label === 'proposal.toExpectDataDelivery')
        await openButton?.action()

        expect(proposalStore.updateProposalStatus).toHaveBeenCalledWith('proposalId', ProposalStatus.ExpectDataDelivery)
        expect(showSuccessMessage).toHaveBeenCalledWith('general.submitted')
        expect(router.push).toHaveBeenCalledWith({ name: layoutStore.lastDashboard })
      })
      it('forwards to finished project', async () => {
        proposalStore.currentProposal!.status = ProposalStatus.DataResearch
        layoutStore.lastDashboard = RouteName.Dashboard

        const actionRow = wrapper.findComponent({ name: 'DetailActionRow' })
        const buttonProps = actionRow.props('buttons') as IDetailActionRow[]
        const openButton = buttonProps.find((button) => button.label === 'proposal.finishProject')
        await openButton?.action()

        expect(proposalStore.updateProposalStatus).toHaveBeenCalledWith('proposalId', ProposalStatus.ReadyToArchive)
        expect(showSuccessMessage).toHaveBeenCalledWith('general.submitted')
        expect(router.push).toHaveBeenCalledWith({ name: layoutStore.lastDashboard })
      })
      it('it declines to finish project', async () => {
        proposalStore.currentProposal!.status = ProposalStatus.FinishedProject
        layoutStore.lastDashboard = RouteName.Dashboard

        const actionRow = wrapper.findComponent({ name: 'DetailActionRow' })
        const buttonProps = actionRow.props('buttons') as IDetailActionRow[]
        const openButton = buttonProps.find((button) => button.label === 'proposal.finishProjectDecline')
        await openButton?.action()

        expect(proposalStore.updateProposalStatus).toHaveBeenCalledWith('proposalId', ProposalStatus.DataResearch)
        expect(showSuccessMessage).toHaveBeenCalledWith('general.submitted')
        expect(router.push).toHaveBeenCalledWith({ name: layoutStore.lastDashboard })
      })
    })
  })
})
