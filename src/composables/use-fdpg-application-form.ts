import { ref, computed, markRaw, defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import { useLayoutStore } from '@/stores/layout.store'
import { useMessageBoxStore, type DecisionType } from '@/stores/messageBox.store'
import { ProposalStatus, type IChecklistItem } from '@/types/proposal.types'
import { RouteName } from '@/types/route-name.enum'
import type { UploadFile } from 'element-plus'

export function useFdpgApplicationForm(
  proposalId: any,
  status: any,
  changeStatus: (status: ProposalStatus) => Promise<void>,
  showErrorMessage: (msg: string) => void,
  showSuccessMessage: (msg: string) => void,
) {
  const messageBoxStore = useMessageBoxStore()
  const proposalStore = useProposalStore()
  const layoutStore = useLayoutStore()
  const router = useRouter()
  const { t } = useI18n()

  const isInitiateContractDialogOpen = ref(false)

  const messageBoxDefaults = {
    cancelButtonText: t('general.cancel'),
    cancelButtonClass: 'el-button--text',
    showCancelButton: true,
  }

  const uacFullyApproved = computed(() => {
    const conditionAccepted =
      proposalStore.currentProposal?.conditionalApprovals.filter(
        (condition) =>
          condition.isAccepted &&
          !proposalStore.currentProposal?.requestedButExcludedLocations.includes(condition.location),
      ) ?? []
    const uacApprovals =
      proposalStore.currentProposal?.uacApprovals.filter(
        (approval) => !proposalStore.currentProposal?.requestedButExcludedLocations.includes(approval.location),
      ) ?? []
    return [...uacApprovals, ...conditionAccepted]
  })

  const uacLocations = computed(() => uacFullyApproved.value.map((a) => a.location))

  const showContractingParticipants = computed(() => {
    return (
      status.value === ProposalStatus.Contracting ||
      status.value === ProposalStatus.ExpectDataDelivery ||
      status.value === ProposalStatus.DataResearch ||
      status.value === ProposalStatus.DataCorrupt ||
      status.value === ProposalStatus.ReadyToArchive ||
      status.value === ProposalStatus.FinishedProject ||
      status.value === ProposalStatus.Archived ||
      status.value === ProposalStatus.Rejected
    )
  })

  const showLocationVotePanel = computed(() => {
    return status.value === ProposalStatus.LocationCheck || showContractingParticipants.value
  })

  const isChecklistDone = computed(() => {
    const checklist = proposalStore.currentProposal?.fdpgChecklist
    if (!checklist) return false

    const verification = checklist.checkListVerification
    if (!verification || !Array.isArray(verification)) return false

    const projectProperties = checklist.projectProperties
    if (!projectProperties || !Array.isArray(projectProperties)) return false

    return (
      verification.every((item: IChecklistItem) => item.isAnswered) &&
      checklist.isRegistrationLinkSent &&
      checklist.initialViewing &&
      checklist.ethicsCheck &&
      checklist.ethicsCheck &&
      projectProperties.every((item: IChecklistItem) => item.isAnswered)
    )
  })

  const handleRequestRevisionClick = () => {
    messageBoxStore.setMessageBoxInfo({
      ...messageBoxDefaults,
      title: 'proposal.requestRevisionModalTitle',
      message: 'proposal.requestRevisionModalDescription',
      confirmButtonText: 'proposal.requestRevision',
      cancelButtonText: 'general.cancel',
      callback: async (decision: DecisionType) =>
        decision === 'confirm' ? await changeStatus(ProposalStatus.Rework) : undefined,
    })
  }

  const handleRejectApplicationClick = () => {
    messageBoxStore.setMessageBoxInfo({
      ...messageBoxDefaults,
      title: 'proposal.rejectRequestModalTitle',
      message: 'proposal.rejectRequestModalDescription',
      confirmButtonText: 'proposal.rejectApplication',
      cancelButtonText: 'general.cancel',
      callback: async (decision: DecisionType) =>
        decision === 'confirm' ? await changeStatus(ProposalStatus.Rejected) : undefined,
    })
  }

  const handleToLocationCheckClick = () => {
    const messageComponent = markRaw(
      defineComponent({
        setup(props) {
          return {}
        },
        template: `<h4>{{$t('proposal.listOfNoMarked')}}:</h4><ul v-if="listOfNoMarked"><li v-for="(item, i) in listOfNoMarked" :key="i">{{$t('proposal.' + item)}}</li></ul>`,
        props: {
          listOfNoMarked: {
            type: Array,
            required: true,
          },
        },
      }),
    )
    messageBoxStore.setMessageBoxInfo({
      ...messageBoxDefaults,
      title: 'proposal.toLocationCheckModalTitle',
      message: 'proposal.toLocationCheckModalDescription',
      confirmButtonText: 'proposal.toLocationCheck',
      cancelButtonText: 'general.cancel',
      messageComponent,
      messageComponentProps: {
        listOfNoMarked:
          proposalStore.currentProposal?.fdpgChecklist?.checkListVerification?.reduce(
            (acc: string[], item: IChecklistItem) => {
              if (item.answer.some((a) => a === 'no')) {
                acc.push(item.questionKey)
              }
              if (item.sublist && item.sublist.length > 0) {
                item.sublist.forEach((subItem) => {
                  if (subItem.answer.some((a) => a === 'no')) {
                    acc.push(subItem.questionKey)
                  }
                })
              }
              return acc
            },
            [],
          ) || [],
      },
      callback: async (decision: DecisionType) => {
        if (decision === 'confirm') {
          await changeStatus(ProposalStatus.LocationCheck)
        }
        messageBoxStore.$patch({
          messageComponent: undefined,
          messageComponentProps: {},
        })
      },
    })
  }

  const handleToContractingClick = () => {
    isInitiateContractDialogOpen.value = true
  }

  const handleToExpectDataDeliveryClick = () => {
    messageBoxStore.setMessageBoxInfo({
      ...messageBoxDefaults,
      title: 'proposal.toExpectDataDeliveryModalTitle',
      message: 'proposal.toExpectDataDeliveryModalDescription',
      confirmButtonText: 'proposal.toExpectDataDelivery',
      cancelButtonText: 'general.cancel',
      callback: async (decision: DecisionType) =>
        decision === 'confirm' ? await changeStatus(ProposalStatus.ExpectDataDelivery) : undefined,
    })
  }

  const handleFinishProjectClick = () => {
    messageBoxStore.setMessageBoxInfo({
      ...messageBoxDefaults,
      title: 'proposal.toReadyToArchiveModalTitle',
      message: 'proposal.toReadyToArchiveModalDescription',
      confirmButtonText: 'proposal.finishProject',
      cancelButtonText: 'general.cancel',
      callback: async (decision: DecisionType) =>
        decision === 'confirm' ? await changeStatus(ProposalStatus.ReadyToArchive) : undefined,
    })
  }

  const handleFinishProjectDeclineClick = () => {
    messageBoxStore.setMessageBoxInfo({
      ...messageBoxDefaults,
      title: 'proposal.declineToReadyToArchiveModalTitle',
      message: 'proposal.declineToReadyToArchiveModalDescription',
      confirmButtonText: 'proposal.finishProjectDecline',
      cancelButtonText: 'general.cancel',
      callback: async (decision: DecisionType) =>
        decision === 'confirm' ? await changeStatus(ProposalStatus.DataResearch) : undefined,
    })
  }

  const handleDownloadLocationCsvClick = async () => {
    if (proposalId.value) {
      await proposalStore.downloadLocationCsv(proposalId.value)
    }
  }

  const handleContractSignConfirm = async (file: UploadFile, selectedLocations: string[]) => {
    await initContracting(selectedLocations, file?.raw)
  }

  const initContracting = async (selectedLocations: string[], file?: File) => {
    if (!file) {
      showErrorMessage(t('general.failedSubmit'))
      return
    }

    try {
      await proposalStore.initContracting(proposalId.value, file, selectedLocations)
      showSuccessMessage(t('general.submitted'))
      await router.push({ name: layoutStore.lastDashboard })
    } catch (error: any) {
      showErrorMessage(t('general.failedSubmit'))
    }
  }

  const handleRegisterProjectClick = async () => {
    messageBoxStore.setMessageBoxInfo({
      ...messageBoxDefaults,
      title: 'proposal.registerProjectModalTitle',
      message: 'proposal.registerProjectModalDescription',
      confirmButtonText: 'proposal.registerProject',
      cancelButtonText: 'general.cancel',
      callback: async (decision: DecisionType) => {
        if (decision === 'confirm') {
          try {
            const copyId = await proposalStore.copyAsInternalRegistration(proposalId.value)
            showSuccessMessage('proposal.projectCopiedForRegistration')

            // Navigate to register/edit route with the new copy ID
            router.push({
              name: RouteName.EditRegisteredProject,
              params: { id: copyId },
            })
          } catch (error: any) {
            showErrorMessage(error?.message || error?.toString() || 'general.genericError')
          }
        }
      },
    })
  }

  return {
    // State
    isInitiateContractDialogOpen,
    uacFullyApproved,
    uacLocations,
    showContractingParticipants,
    showLocationVotePanel,
    isChecklistDone,

    // Methods
    handleRequestRevisionClick,
    handleRejectApplicationClick,
    handleToLocationCheckClick,
    handleToContractingClick,
    handleToExpectDataDeliveryClick,
    handleFinishProjectClick,
    handleFinishProjectDeclineClick,
    handleDownloadLocationCsvClick,
    handleContractSignConfirm,
    handleRegisterProjectClick,
    initContracting,
  }
}
