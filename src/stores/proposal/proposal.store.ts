import { ProposalService } from '@/services/proposal/proposal.service'
import type { ISortAndOrderBy, PanelQuery } from '@/types/sort-filter.types'
import { SortDirection } from '@/types/sort-filter.types'
import {
  DeliveryAcceptance,
  type IApplicant,
  type IDataDelivery,
  type IDeliveryInfo,
  type IDizDetails,
  type IEditAdditionalLocationProposalInformation,
  type IFdpgChecklist,
  type IParticipant,
  type IProjectAssignee,
  type IProposal,
  type IProposalCount,
  type IProposalDetail,
  type IPublicationCreateAndUpdate,
  type IReportCreate,
  type IReportUpdate,
  type IResearcherIdentity,
  type ISelectedCohort,
  type IUpload,
  type ProposalStatus,
  type SortableFields,
} from '@/types/proposal.types'
import { defineStore } from 'pinia'
import type { DeepPartial } from '@/types/deep-partial.type'
import type { DirectUpload } from '@/types/upload.types'
import { transformForm } from '@/utils/form-transform'
import { debounce } from 'lodash-es'
import { getDateDiff } from '@/utils/date.util'
import type { ContractDecision } from '@/types/sign-contract.types'
import type { DizApprovalDecision } from '@/types/diz-approval.types'
import type { UacApprovalDecision } from '@/types/uac-approval.types'
import type { DizConditionApprovalDecision } from '@/types/diz-condition-approval.types'
import type { Deadlines } from '@/types/due-date.enum'

export interface IProposalState {
  apiService: ProposalService
  proposals: { [key in PanelQuery]?: IProposalDetail[] }
  currentProposal?: IProposal
  currentSortField: SortableFields
  currentSortDirection: SortDirection
  counts: { [key in PanelQuery]?: IProposalCount }
  _checkListLastSuccess: IFdpgChecklist
  search?: string
}

export const useProposalStore = defineStore('Proposal', {
  state: (): IProposalState => ({
    apiService: new ProposalService(),
    proposals: {},
    currentProposal: undefined,
    currentSortField: 'submittedAt',
    currentSortDirection: SortDirection.DESC,
    counts: {},
    _checkListLastSuccess: {
      isRegistrationLinkSent: false,
      initialViewing: false,
      depthCheck: false,
      ethicsCheck: false,
      checkListVerification: [],
      fdpgInternalCheckNotes: '',
      projectProperties: [],
    },
    search: undefined,
  }),

  actions: {
    async fetch(sortAndFilterBy: ISortAndOrderBy<any>): Promise<IProposalDetail[]> {
      const { panelQuery } = sortAndFilterBy
      const data = await this.apiService.getAll(sortAndFilterBy)
      this.proposals[panelQuery] = data

      this.counts[panelQuery] = data.reduce(
        (acc, proposal) => {
          proposal.computedDueDate = proposal.dueDateForStatus ? getDateDiff(proposal.dueDateForStatus, 0) : undefined
          if (proposal.computedDueDate !== undefined && proposal.computedDueDate < 0) {
            acc.critical++
          } else if (proposal.computedDueDate !== undefined) {
            acc.high++
          } else {
            acc.low++
          }
          return acc
        },
        {
          total: data.length,
          critical: 0,
          high: 0,
          low: 0,
        },
      )
      return data
    },

    async createProposal(proposal: DeepPartial<IProposal>): Promise<IProposal> {
      return this.apiService.create(proposal)
    },

    async setCurrentProposal(id?: string): Promise<IProposal> {
      if (id) {
        const result = await this.apiService.get(id)
        this.currentProposal = transformForm(result) as IProposal
      } else {
        this.currentProposal = transformForm() as IProposal
      }
      this._checkListLastSuccess = Object.assign({}, this.currentProposal.fdpgChecklist)

      return transformForm(this.currentProposal) as IProposal
    },

    async updateProposal(id: string, proposal: DeepPartial<IProposal>): Promise<IProposal> {
      return this.apiService.update(id, proposal)
    },

    async updateLockingState(id: string, lockingState: boolean): Promise<void> {
      await this.apiService.updateLockingState(id, lockingState)
    },

    async updateProposalStatus(id: string, status: ProposalStatus): Promise<void> {
      await this.apiService.updateStatus(id, status)
    },

    async setUacVote(id: string, decision: UacApprovalDecision): Promise<void> {
      await this.apiService.setUacVote(id, decision)
    },

    async markUacConditionAsAccepted(id: string, conditionId: string, value: boolean): Promise<void> {
      const data = await this.apiService.markUacConditionAsAccepted(id, conditionId, value)
      if (this.currentProposal && this.currentProposal._id === id) {
        this.currentProposal = {
          ...this.currentProposal,
          ...data,
        }
      }
    },

    async setDizApproval(id: string, decision: DizApprovalDecision): Promise<void> {
      await this.apiService.setDizApproval(id, decision)
    },

    async setDizConditionApproval(id: string, decision: DizConditionApprovalDecision): Promise<void> {
      await this.apiService.setDizConditionApproval(id, decision)
    },

    async signContract(id: string, decision: ContractDecision): Promise<void> {
      await this.apiService.signContract(id, decision)
    },

    async initContracting(id: string, file: File, selectedLocations: string[]): Promise<void> {
      await this.apiService.initContracting(id, file, selectedLocations)
    },

    async updateContracting(id: string, file: File, contractDraftToBeReplacedId: string): Promise<void> {
      await this.apiService.updateContracting(id, file, contractDraftToBeReplacedId)
    },

    async uploadFile(id: string, file: File, type: DirectUpload): Promise<void> {
      const uploadResult = await this.apiService.uploadFile(id, file, type)
      if (this.currentProposal) {
        if (this.currentProposal.uploads) {
          this.currentProposal.uploads.push(uploadResult)
        } else {
          this.currentProposal.uploads = [uploadResult]
        }
      }
    },
    async removeUpload(id: string, uploadId: string): Promise<void> {
      await this.apiService.removeFile(id, uploadId)
      if (this.currentProposal?.uploads) {
        const currentUploadIndex = this.currentProposal.uploads.findIndex((upload) => upload._id === uploadId)
        if (currentUploadIndex !== -1) {
          this.currentProposal.uploads.splice(currentUploadIndex, 1)
        }
      }
    },

    async removeUploads(id: string, uploadIds: string[]): Promise<void> {
      const successFullRemovalIds: string[] = []
      let failCount = 0

      for (const uploadId of uploadIds) {
        try {
          await this.apiService.removeFile(id, uploadId)
          successFullRemovalIds.push(uploadId)
        } catch (error) {
          console.log(error)
          failCount++
        }
      }

      if (this.currentProposal?.uploads && this.currentProposal?._id === id) {
        this.currentProposal.uploads = this.currentProposal.uploads.filter(
          (upload) => !successFullRemovalIds.includes(upload._id),
        )
      }

      if (failCount > 0) {
        throw new Error(`Failed to remove ${failCount} uploads`)
      }
    },

    async getDownloadUrl(id: string, uploadId: string): Promise<string> {
      return this.apiService.getDownloadUrl(id, uploadId)
    },

    async getResearcherInfo(id: string): Promise<IResearcherIdentity[]> {
      return this.apiService.getResearcherInfo(id)
    },

    async deleteProposal(id: string, panelQuery: PanelQuery): Promise<void> {
      await this.apiService.delete(id)

      // Find and delete deleted proposal
      const index = this.proposals[panelQuery]?.findIndex((proposal) => proposal._id === id) ?? -1
      if (index !== -1) {
        this.proposals[panelQuery]?.splice(index, 1)
      }
    },

    async duplicateProposal(id: string): Promise<IProposal> {
      return this.apiService.duplicate(id)
    },

    async checkUnique(value: string, id?: string): Promise<boolean> {
      return this.apiService.checkUnique(value, id)
    },

    _updateFdpgChecklistDebounced: debounce(async function (
      id: string,
      checklist: Partial<IFdpgChecklist>,
      store: unknown,
      errorCb?: (...args: any) => void,
    ) {
      const typedStore = store as IProposalState

      try {
        const updatedItem = await typedStore.apiService.updateFdpgChecklist(id, checklist)
        const currentProposal = typedStore.currentProposal

        if (!currentProposal || !updatedItem || !currentProposal.fdpgChecklist) return

        const checklistData = currentProposal.fdpgChecklist

        if ('isRegistrationLinkSent' in updatedItem) {
          checklistData.isRegistrationLinkSent = updatedItem.isRegistrationLinkSent
        } else if ('initialViewing' in updatedItem) {
          checklistData.initialViewing = updatedItem.initialViewing
        } else if ('depthCheck' in updatedItem) {
          checklistData.depthCheck = updatedItem.depthCheck
        } else if ('ethicsCheck' in updatedItem) {
          checklistData.ethicsCheck = updatedItem.ethicsCheck
        } else if ('fdpgInternalCheckNotes' in updatedItem) {
          checklistData.fdpgInternalCheckNotes =
            updatedItem.fdpgInternalCheckNotes ?? checklistData.fdpgInternalCheckNotes
        } else if ('_id' in updatedItem) {
          const targetFields = ['checkListVerification', 'projectProperties'] as const

          for (const field of targetFields) {
            const list = checklistData[field]
            const index = list?.findIndex((item) => item._id === updatedItem._id)
            if (index !== -1 && list) {
              list[index] = {
                ...list[index],
                ...updatedItem,
              }
              break
            }
          }
        }

        typedStore.currentProposal = {
          ...currentProposal,
          fdpgChecklist: checklistData,
        }
      } catch (error) {
        if (errorCb) {
          errorCb(error)
        }
        throw error
      }
    }, 500),

    async updateFdpgChecklistImmediate(
      id: string,
      checklist: Partial<IFdpgChecklist>,
      errorCb?: (...args: any) => void,
    ): Promise<void> {
      const typedStore = this as unknown as IProposalState

      try {
        const updatedItem = await typedStore.apiService.updateFdpgChecklist(id, checklist)
        const currentProposal = typedStore.currentProposal

        if (!currentProposal || !updatedItem || !currentProposal.fdpgChecklist) return

        const checklistData = currentProposal.fdpgChecklist

        if ('isRegistrationLinkSent' in updatedItem) {
          checklistData.isRegistrationLinkSent = updatedItem.isRegistrationLinkSent
        } else if ('initialViewing' in updatedItem) {
          checklistData.initialViewing = updatedItem.initialViewing
        } else if ('depthCheck' in updatedItem) {
          checklistData.depthCheck = updatedItem.depthCheck
        } else if ('ethicsCheck' in updatedItem) {
          checklistData.ethicsCheck = updatedItem.ethicsCheck
        } else if ('fdpgInternalCheckNotes' in updatedItem) {
          checklistData.fdpgInternalCheckNotes =
            updatedItem.fdpgInternalCheckNotes ?? checklistData.fdpgInternalCheckNotes
        } else if ('_id' in updatedItem) {
          const targetFields = ['checkListVerification', 'projectProperties'] as const

          for (const field of targetFields) {
            const list = checklistData[field]
            const index = list?.findIndex((item) => item._id === updatedItem._id)
            if (index !== -1 && list) {
              list[index] = {
                ...list[index],
                ...updatedItem,
              }
              break
            }
          }
        }

        typedStore.currentProposal = {
          ...currentProposal,
          fdpgChecklist: checklistData,
        }
      } catch (error) {
        if (errorCb) {
          errorCb(error)
        }
        throw error
      }
    },

    async updateFdpgChecklist(
      id: string,
      checklist: Partial<IFdpgChecklist>,
      errorCb?: (...args: any) => void,
    ): Promise<void> {
      return this._updateFdpgChecklistDebounced(id, checklist, this, errorCb)
    },

    async markSectionAsDone(proposalId: string, sectionId: string, value: boolean): Promise<void> {
      await this.apiService.markSectionAsDone(proposalId, sectionId, value)
    },

    setSortField(field: SortableFields) {
      this.currentSortField = field
    },

    toggleSortDirection() {
      this.currentSortDirection =
        this.currentSortDirection === SortDirection.ASC ? SortDirection.DESC : SortDirection.ASC
    },

    async createProposalPublication(proposalId: string, publication: IPublicationCreateAndUpdate): Promise<void> {
      const resp = await this.apiService.createPublication(proposalId, publication)
      if (this.currentProposal?._id === proposalId) {
        this.currentProposal.publications = resp
      }
    },
    async updateProposalPublication(
      proposalId: string,
      publicationId: string,
      publication: IPublicationCreateAndUpdate,
    ): Promise<void> {
      const resp = await this.apiService.updatePublication(proposalId, publicationId, publication)
      if (this.currentProposal?._id === proposalId) {
        this.currentProposal.publications = resp
      }
    },
    async deletePublication(proposalId: string, publicationId: string): Promise<void> {
      await this.apiService.deletePublication(proposalId, publicationId)
      if (this.currentProposal?._id === proposalId) {
        this.currentProposal.publications = this.currentProposal?.publications.filter(
          (publication) => publication._id !== publicationId,
        )
      }
    },
    async getReports(proposalId: string): Promise<void> {
      const resp = await this.apiService.getReports(proposalId)
      if (this.currentProposal?._id === proposalId) {
        this.currentProposal.reports = resp
      }
    },
    async getReportContent(proposalId: string, reportId: string): Promise<string> {
      return await this.apiService.getReportContent(proposalId, reportId)
    },
    async createProposalReport(proposalId: string, report: IReportCreate): Promise<void> {
      const resp = await this.apiService.createReport(proposalId, report)
      if (this.currentProposal?._id === proposalId) {
        this.currentProposal.reports.push(resp)
      }
    },
    async updateProposalReport(proposalId: string, reportId: string, report: IReportUpdate): Promise<void> {
      const resp = await this.apiService.updateReport(proposalId, reportId, report)
      if (this.currentProposal?._id === proposalId) {
        this.currentProposal.reports = this.currentProposal.reports.filter((report) => report._id !== reportId)
        this.currentProposal.reports.push(resp)
      }
    },
    async deleteReport(proposalId: string, reportId: string): Promise<void> {
      await this.apiService.deleteReport(proposalId, reportId)
      if (this.currentProposal?._id === proposalId) {
        this.currentProposal.reports = this.currentProposal?.reports.filter((report) => report._id !== reportId)
      }
    },
    async updateFdpgCheckNotes(proposalId: string, fdpgCheckNotes: string): Promise<void> {
      await this.apiService.updateFdpgCheckNotes(proposalId, fdpgCheckNotes)
    },
    async getProposalPdfFile(id: string): Promise<Blob> {
      return await this.apiService.getProposalPdfFile(id)
    },

    async revertLocationVote(id: string, location: string): Promise<void> {
      await this.apiService.revertLocationVote(id, location)
      await this.setCurrentProposal(id)
    },

    async updateAdditionalLocationInformation(
      id: string,
      additionalLocationInformation: IEditAdditionalLocationProposalInformation,
    ) {
      await this.apiService.updateAdditionalLocationInformation(id, additionalLocationInformation)
    },

    isCurrentUserParticipatingScientist(): boolean {
      return !!this.currentProposal?.isParticipatingScientist
    },

    async updateDeadlines(id: string, deadlines: Deadlines): Promise<void> {
      await this.apiService.updateDeadlines(id, deadlines)
      await this.setCurrentProposal(id)
    },

    async uploadManualCohort(
      proposalId: string,
      newCohort: ISelectedCohort,
      file: File,
    ): Promise<{ insertedCohort?: ISelectedCohort; uploadedFile?: IUpload }> {
      const { insertedCohort, uploadedFile } = await this.apiService.uploadManualCohort(proposalId, newCohort, file)
      return { insertedCohort, uploadedFile }
    },

    async addAutomaticCohort(proposalId: string, newCohort: ISelectedCohort): Promise<ISelectedCohort> {
      return await this.apiService.addAutomaticCohort(proposalId, newCohort)
    },

    async deleteCohort(proposalId: string, cohortId: string): Promise<ISelectedCohort> {
      return await this.apiService.deleteCohort(proposalId, cohortId)
    },

    async getFeasibilityCsvByQueryId(feasibilityQueryId: number, queryName: string): Promise<void> {
      if (!this.currentProposal?._id) {
        throw new Error('No persisted proposal selected')
      }

      await this.apiService.getFeasibilityCsvByQueryId(this.currentProposal?._id, feasibilityQueryId, queryName)
    },
    async updateParticipants(id: string, participants: IParticipant[]): Promise<void> {
      const updatedProposal = await this.apiService.updateParticipants(id, participants)
      if (this.currentProposal?._id === id) {
        this.currentProposal = {
          ...this.currentProposal,
          participants: updatedProposal.participants,
        }
      }
    },
    async removeParticipant(id: string, participantId: string): Promise<void> {
      const updatedProposal = await this.apiService.removeParticipant(id, participantId)
      if (this.currentProposal?._id === id) {
        this.currentProposal = {
          ...this.currentProposal,
          participants: updatedProposal.participants,
        }
      }
    },

    async updateApplicantParticipantRole(id: string, applicant: IApplicant): Promise<void> {
      await this.apiService.updateApplicantParticipantRole(id, applicant)
      // Update the current proposal if it matches the updated proposal
      if (this.currentProposal?._id === id) {
        this.currentProposal = {
          ...this.currentProposal,
          applicant: {
            ...this.currentProposal.applicant,
            ...applicant,
          },
        }
      }
    },

    async makeParticipantResponsible(id: string, participantId: string): Promise<void> {
      await this.apiService.makeParticipantResponsible(id, participantId)
      // Refresh the proposal to get the updated data
      await this.setCurrentProposal(id)
    },

    async createDizDetails(proposalId: string, data: IDizDetails): Promise<void> {
      await this.apiService.createDizDetails(proposalId, data)

      this.setCurrentProposal(proposalId)
    },

    async updateDizDetails(proposalId: string, dizDetailsId: string, data: IDizDetails): Promise<IDizDetails> {
      const updatedDizDetails = await this.apiService.updateDizDetails(proposalId, dizDetailsId, data)

      if (this.currentProposal && this.currentProposal._id === proposalId) {
        const index = this.currentProposal.dizDetails?.findIndex((detail) => detail._id === dizDetailsId)
        if (index !== undefined && index !== -1 && this.currentProposal.dizDetails) {
          this.currentProposal.dizDetails[index] = updatedDizDetails
        }
      }

      return updatedDizDetails
    },
    async exportAllUploadsAsZip(): Promise<void> {
      if (!this.currentProposal?._id) {
        throw new Error('No proposal selected for export')
      }
      await this.apiService.exportAllUploadsAsZip(this.currentProposal._id)
    },
    async downloadLocationCsv(proposalId: string): Promise<void> {
      await this.apiService.downloadLocationCsv(proposalId)
    },
    async copyAsInternalRegistration(proposalId: string): Promise<string> {
      return await this.apiService.copyAsInternalRegistration(proposalId)
    },

    async syncProposal(proposalId: string): Promise<{ success: boolean; error?: string }> {
      const result = await this.apiService.syncProposal(proposalId)

      if (this.currentProposal?._id === proposalId) {
        await this.setCurrentProposal(proposalId)
      }

      return result
    },

    async retrySyncProposal(proposalId: string): Promise<{ success: boolean; error?: string }> {
      const result = await this.apiService.retrySyncProposal(proposalId)

      if (this.currentProposal?._id === proposalId) {
        await this.setCurrentProposal(proposalId)
      }

      return result
    },

    async syncAllProposals(): Promise<{
      total: number
      synced: number
      failed: number
      errors: Array<{ projectAbbreviation: string; error: string }>
    }> {
      const result = await this.apiService.syncAllProposals()

      const fdpgPublishedPanels: PanelQuery[] = [
        'FDPG_PUBLISHED_READY' as PanelQuery,
        'FDPG_PUBLISHED_PUBLISHED' as PanelQuery,
      ]

      await Promise.all(
        fdpgPublishedPanels.map((panelQuery) =>
          this.fetch({
            panelQuery,
            order: this.currentSortDirection,
            sortBy: this.currentSortField,
          }),
        ),
      )

      return result
    },

    async registerDataDeliveryRequestAtDms(proposalId: string, dmsId: string): Promise<IDataDelivery> {
      const dataDelivery = await this.apiService.registerDataDeliveryRequestAtDms(proposalId, dmsId)

      if (proposalId === this.currentProposal?._id) {
        this.currentProposal = { ...this.currentProposal, dataDelivery: dataDelivery }
      }

      return dataDelivery
    },

    async updateDmsForDataDelivery(proposalId: string, dmsId: string): Promise<IDataDelivery> {
      const dataDelivery = await this.apiService.updateDmsForDataDelivery(proposalId, dmsId)

      if (proposalId === this.currentProposal?._id) {
        this.currentProposal = { ...this.currentProposal, dataDelivery: dataDelivery }
      }

      return dataDelivery
    },

    async initiateDeliveryInfo(proposalId: string, deliveryInfo: IDeliveryInfo): Promise<IDataDelivery> {
      const dataDelivery = await this.apiService.initiateDeliveryInfo(proposalId, deliveryInfo)

      if (proposalId === this.currentProposal?._id) {
        this.currentProposal = { ...this.currentProposal, dataDelivery: dataDelivery }
      }

      return dataDelivery
    },

    async updateDmsAcceptanceForDataDelivery(
      proposalId: string,
      dmsId: string,
      acceptance: DeliveryAcceptance,
    ): Promise<IDataDelivery> {
      const dataDelivery = await this.apiService.updateDmsAcceptanceForDataDelivery(proposalId, dmsId, acceptance)

      if (proposalId === this.currentProposal?._id) {
        this.currentProposal = { ...this.currentProposal, dataDelivery: dataDelivery }
      }

      return dataDelivery
    },

    async updateProjectAssignee(proposalId: string, projectAssignee?: IProjectAssignee): Promise<void> {
      await this.apiService.updateProjectAssignee(proposalId, projectAssignee)
    },
  },

  getters: {
    filteredProposal: (state) => {
      const searchString = state.search?.trim()?.toLocaleLowerCase()
      if (searchString !== undefined && searchString.length > 1) {
        return Object.keys(state.proposals).reduce((acc: { [key in PanelQuery]?: IProposalDetail[] }, key) => {
          acc[key as PanelQuery] = state.proposals[key as PanelQuery]?.filter(
            (proposal: IProposalDetail) =>
              proposal.projectAbbreviation?.toLocaleLowerCase().includes(searchString) ||
              proposal.ownerName?.toLocaleLowerCase().includes(searchString) ||
              proposal.projectTitle?.toLocaleLowerCase().includes(searchString),
          )
          return acc
        }, {})
      }

      return state.proposals
    },
  },
})
