import { ApiClient } from '@/httpClients/api/api.client'
import type { ISortAndOrderBy } from '@/types/sort-filter.types'
import type {
  IFdpgChecklist,
  IProposal,
  IProposalDetail,
  IProposalMarkConditionAcceptedReturnDto,
  IResearcherIdentity,
  IPublicationGet,
  IUpload,
  ProposalStatus,
  IPublicationCreateAndUpdate,
  IReportGet,
  IReportCreate,
  IReportUpdate,
} from '@/types/proposal.types'
import type { DeepPartial } from '@/types/deep-partial.type'
import type { DirectUpload } from '@/types/upload.types'
import type { ContractDecision } from '@/types/sign-contract.types'
import type { UacApprovalDecision } from '@/types/uac-approval.types'
import type { DizApprovalDecision } from '@/types/diz-approval.types'
import type { MiiLocation } from '@/types/location.enum'

export class ProposalService {
  private basePath = '/proposals'
  private apiClient = new ApiClient().client

  async create(proposal: DeepPartial<IProposal>): Promise<IProposal> {
    const response = await this.apiClient.post(this.basePath, proposal)
    return response.data
  }

  async get(id: string): Promise<IProposal> {
    const response = await this.apiClient.get(`${this.basePath}/${id}`)
    return response.data
  }

  async getAll({ order, sortBy, panelQuery }: ISortAndOrderBy<IProposal>): Promise<IProposalDetail[]> {
    const params = {
      order,
      sortBy,
      panelQuery,
    }
    const response = await this.apiClient.get(this.basePath, { params })
    return response.data
  }

  async update(id: string, proposal: DeepPartial<IProposal>): Promise<IProposal> {
    const response = await this.apiClient.put(`${this.basePath}/${id}`, proposal)
    return response.data
  }

  async updateStatus(id: string, status: ProposalStatus): Promise<IProposal> {
    const response = await this.apiClient.put(`${this.basePath}/${id}/status`, { value: status })
    return response.data
  }

  async updateLockingState(id: string, lockingState: boolean): Promise<IProposal> {
    const response = await this.apiClient.put(`${this.basePath}/${id}/isLocked`, { value: lockingState })
    return response.data
  }

  async setUacVote(id: string, decision: UacApprovalDecision): Promise<void> {
    const formData = new FormData()
    formData.append('value', decision.value.toString())

    if (decision.value) {
      formData.append('file', decision.file as Blob)
      formData.append('dataAmount', decision.dataAmount.toString())
    } else {
      formData.append('declineReason', decision.declineReason)
    }

    await this.apiClient.post(`${this.basePath}/${id}/uacApproval`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  }

  async markUacConditionAsAccepted(
    id: string,
    conditionId: string,
    value: boolean,
  ): Promise<IProposalMarkConditionAcceptedReturnDto> {
    const result = await this.apiClient.put(`${this.basePath}/${id}/uacApproval/${conditionId}/isAccepted`, { value })
    return result.data
  }

  async setDizApproval(id: string, decision: DizApprovalDecision): Promise<void> {
    await this.apiClient.post(`${this.basePath}/${id}/dizApproval`, decision)
  }

  async signContract(id: string, decision: ContractDecision): Promise<IProposal> {
    const formData = new FormData()
    formData.append('value', decision.value.toString())

    if (decision.value === true) {
      formData.append('file', decision.file as Blob)
    } else {
      formData.append('declineReason', decision.declineReason)
    }

    const response = await this.apiClient.post(`${this.basePath}/${id}/signContract`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  async initContracting(id: string, file: File, locations: MiiLocation[]): Promise<IProposal> {
    const formData = new FormData()
    formData.append('file', file as Blob)
    formData.append('locations', JSON.stringify(locations))

    const response = await this.apiClient.put(`${this.basePath}/${id}/init-contracting`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  async uploadFile(id: string, file: File, type: DirectUpload): Promise<IUpload> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)
    const response = await this.apiClient.post(`${this.basePath}/${id}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  async removeFile(id: string, uploadId: string): Promise<void> {
    return this.apiClient.delete(`${this.basePath}/${id}/upload/${uploadId}`)
  }

  async getDownloadUrl(id: string, uploadId: string): Promise<string> {
    const response = await this.apiClient.get(`${this.basePath}/${id}/upload/${uploadId}`)
    return response.data
  }

  async getResearcherInfo(id: string): Promise<IResearcherIdentity[]> {
    const response = await this.apiClient.get(`${this.basePath}/${id}/researcherInfo`)
    return response.data
  }

  async delete(id: string): Promise<void> {
    const response = await this.apiClient.delete(`${this.basePath}/${id}`)
    return response.data
  }

  async duplicate(id: string): Promise<IProposal> {
    const response = await this.apiClient.post(`${this.basePath}/${id}/duplicate`)
    return response.data
  }

  async checkUnique(projectAbbreviation: string, id?: string): Promise<boolean> {
    const response = await this.apiClient.post(
      `${this.basePath}/is-unique`,
      { projectAbbreviation },
      { params: { id } },
    )
    return response.data
  }

  async updateFdpgChecklist(id: string, checklist: IFdpgChecklist): Promise<void> {
    await this.apiClient.put(`${this.basePath}/${id}/fdpg-checklist`, checklist)
  }

  async markSectionAsDone(proposalId: string, sectionId: string, value: boolean): Promise<void> {
    await this.apiClient.put(`${this.basePath}/${proposalId}/${sectionId}/isDone`, { value })
  }

  async createPublication(proposalId: string, publication: IPublicationCreateAndUpdate): Promise<IPublicationGet[]> {
    const response = await this.apiClient.post(`${this.basePath}/${proposalId}/publications`, publication)
    return response.data
  }

  async deletePublication(proposalId: string, publicationId: string): Promise<void> {
    await this.apiClient.delete(`${this.basePath}/${proposalId}/publications/${publicationId}`)
  }

  async updatePublication(
    proposalId: string,
    publicationId: string,
    publication: IPublicationCreateAndUpdate,
  ): Promise<IPublicationGet[]> {
    const response = await this.apiClient.put(
      `${this.basePath}/${proposalId}/publications/${publicationId}`,
      publication,
    )
    return response.data
  }

  async createReport(proposalId: string, report: IReportCreate): Promise<IReportGet> {
    const form = new FormData()
    report.files.forEach((file) => {
      form.append('files', file as Blob)
    })
    form.append('content', report.content)
    form.append('title', report.title)
    const response = await this.apiClient.post(`${this.basePath}/${proposalId}/reports`, form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  async deleteReport(proposalId: string, reportId: string): Promise<void> {
    await this.apiClient.delete(`${this.basePath}/${proposalId}/reports/${reportId}`)
  }

  async updateReport(proposalId: string, reportId: string, report: IReportUpdate): Promise<IReportGet> {
    const form = new FormData()
    report.files.forEach((file) => {
      form.append('files', file as Blob)
    })
    form.append('content', report.content)
    form.append('title', report.title)
    form.append('keepUploads', report.keepUploads.join(','))
    const response = await this.apiClient.put(`${this.basePath}/${proposalId}/reports/${reportId}`, form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  async getReports(proposalId: string): Promise<IReportGet[]> {
    const response = await this.apiClient.get(`${this.basePath}/${proposalId}/reports`)
    return response.data
  }

  async getReportContent(proposalId: string, reportId: string): Promise<string> {
    const response = await this.apiClient.get(`${this.basePath}/${proposalId}/reports/${reportId}/content`)
    return response.data
  }

  async updateFdpgCheckNotes(id: string, fdpgCheckNotes: string): Promise<void> {
    await this.apiClient.put(`${this.basePath}/${id}/fdpgCheckNotes`, { value: fdpgCheckNotes })
  }
}
