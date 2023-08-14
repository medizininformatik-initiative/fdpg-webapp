import { ProposalService } from '@/services/proposal/proposal.service'
import type { ISortAndOrderBy, PanelQuery } from '@/types/sort-filter.types'
import { SortDirection } from '@/types/sort-filter.types'
import type {
  IProposal,
  IProposalDetail,
  IProposalCount,
  ProposalStatus,
  IFdpgChecklist,
  IResearcherIdentity,
  SortableFields,
  IPublicationCreateAndUpdate,
  IReportCreate,
  IReportUpdate,
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
import type { MiiLocation } from '@/types/location.enum'
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
    _checkListLastSuccess: {},
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

    async signContract(id: string, decision: ContractDecision): Promise<void> {
      await this.apiService.signContract(id, decision)
    },

    async initContracting(id: string, file: File, selectedLocations: MiiLocation[]): Promise<void> {
      await this.apiService.initContracting(id, file, selectedLocations)
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
      checklist: IFdpgChecklist,
      store: unknown,
      errorCb?: (...args) => void,
    ) {
      const typedStore = store as IProposalState

      try {
        await typedStore.apiService.updateFdpgChecklist(id, checklist)
        typedStore._checkListLastSuccess = checklist
      } catch (error) {
        if (errorCb) {
          errorCb(error)
        }

        if (typedStore.currentProposal) {
          typedStore.currentProposal.fdpgChecklist = { ...typedStore._checkListLastSuccess }
        }
      }
    },
    500),

    async updateFdpgChecklist(id: string, checklist: IFdpgChecklist, errorCb?: (...args) => void): Promise<void> {
      if (this.currentProposal) {
        this.currentProposal.fdpgChecklist = { ...checklist }
      }
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
  },

  getters: {
    filteredProposal: (state) => {
      const searchString = state.search?.trim()?.toLocaleLowerCase()
      if (searchString !== undefined && searchString.length > 1) {
        return Object.keys(state.proposals).reduce((acc, key) => {
          acc[key] = state.proposals[key].filter(
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
