import { ApiClient } from '@/httpClients/api/api.client'
import type { ISortAndOrderBy } from '@/types/sort-filter.types'
import {
  DeliveryAcceptance,
  type FdpgChecklistItemUpdateResponse,
  type IApplicant,
  type IDataDelivery,
  type IDizDetails,
  type IEditAdditionalLocationProposalInformation,
  type IFdpgChecklist,
  type IParticipant,
  type IProjectAssignee,
  type IProposal,
  type IProposalDetail,
  type IProposalMarkConditionAcceptedReturnDto,
  type IPublicationCreateAndUpdate,
  type IPublicationGet,
  type IReportCreate,
  type IReportGet,
  type IReportUpdate,
  type IResearcherIdentity,
  type ISelectedCohort,
  type IUpload,
  type ProposalStatus,
} from '@/types/proposal.types'
import type { DeepPartial } from '@/types/deep-partial.type'
import type { DirectUpload } from '@/types/upload.types'
import type { ContractDecision } from '@/types/sign-contract.types'
import type { UacApprovalDecision } from '@/types/uac-approval.types'
import type { DizApprovalDecision } from '@/types/diz-approval.types'
import type { DizConditionApprovalDecision } from '@/types/diz-condition-approval.types'
import type { Deadlines } from '@/types/due-date.enum'
import type { AxiosResponse } from 'axios'

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
      decision.conditionReasoning && formData.append('conditionReasoning', decision.conditionReasoning)
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

  async setDizConditionApproval(id: string, vote: DizConditionApprovalDecision): Promise<void> {
    await this.apiClient.post(`${this.basePath}/${id}/dizConditionApproval`, vote)
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

  async initContracting(id: string, file: File, locations: string[]): Promise<void> {
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

  async updateContracting(id: string, file: File, contractDraftToBeReplacedId: string): Promise<void> {
    const formData = new FormData()
    formData.append('file', file as Blob)
    formData.append('uploadId', contractDraftToBeReplacedId)

    const response = await this.apiClient.post(`${this.basePath}/${id}/update-contracting`, formData, {
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

  async updateFdpgChecklist(id: string, checklist: Partial<IFdpgChecklist>): Promise<FdpgChecklistItemUpdateResponse> {
    const response = await this.apiClient.put(`${this.basePath}/${id}/fdpg-checklist`, checklist)
    return response.data
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

  async getProposalPdfFile(id: string): Promise<Blob> {
    const response = await this.apiClient.get(`${this.basePath}/${id}/proposalPdfFile`, {
      responseType: 'arraybuffer',
    })
    return response.data
  }

  async revertLocationVote(id: string, location: string): Promise<void> {
    await this.apiClient.post(`${this.basePath}/${id}/revertLocationVote`, { location })
  }

  async updateAdditionalLocationInformation(
    id: string,
    additionalLocationInformation: IEditAdditionalLocationProposalInformation,
  ): Promise<void> {
    await this.apiClient.post(`${this.basePath}/${id}/additionalLocationInformation`, {
      ...additionalLocationInformation,
    })
  }

  async updateDeadlines(proposalId: string, deadlines: Deadlines): Promise<void> {
    await this.apiClient.put(`${this.basePath}/${proposalId}/deadlines`, deadlines)
  }

  async uploadManualCohort(
    id: string,
    newCohort: ISelectedCohort,
    file: File,
  ): Promise<{ insertedCohort?: ISelectedCohort; uploadedFile?: IUpload }> {
    const formData = new FormData()
    formData.append('file', file as Blob)
    formData.append(
      'newCohort',
      JSON.stringify({
        label: newCohort.label,
        comment: newCohort.comment,
        isManualUpload: newCohort.isManualUpload,
        numberOfPatients: newCohort.numberOfPatients,
      }),
    )

    const response = await this.apiClient.put(`${this.basePath}/${id}/cohort/manual`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  async addAutomaticCohort(proposalId: string, cohort: ISelectedCohort): Promise<ISelectedCohort> {
    const response = await this.apiClient.put(`${this.basePath}/${proposalId}/cohort/automatic`, { newCohort: cohort })
    return response.data
  }

  async deleteCohort(id: string, cohortId: string): Promise<ISelectedCohort> {
    const result = await this.apiClient.delete(`${this.basePath}/${id}/cohort/${cohortId}`)
    return result.data
  }

  async getFeasibilityCsvByQueryId(proposalId: string, feasibilityQueryId: number, queryName: string): Promise<void> {
    const response = await this.apiClient.post(
      `${this.basePath}/query/csv`,
      { proposalId, queryId: feasibilityQueryId },
      { responseType: 'blob' },
    )

    if (response.status === 200) {
      const url = window.URL.createObjectURL(new Blob([response.data]))

      const a = document.createElement('a')
      a.href = url
      a.download = `${queryName}.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } else {
      throw new Error('Could not fetch the feasibility csv')
    }
  }
  async updateParticipants(id: string, participants: IParticipant[]): Promise<IProposal> {
    const response = await this.apiClient.patch(`${this.basePath}/${id}/participants`, { participants })
    return response.data
  }
  async removeParticipant(id: string, participantId: string): Promise<IProposal> {
    const response = await this.apiClient.delete(`${this.basePath}/${id}/participants/${participantId}`)
    return response.data
  }

  async updateApplicantParticipantRole(id: string, applicant: IApplicant): Promise<void> {
    await this.apiClient.put(`${this.basePath}/${id}/applicant/participant-role`, applicant)
  }

  async makeParticipantResponsible(id: string, participantId: string): Promise<void> {
    await this.apiClient.put(`${this.basePath}/${id}/participants/${participantId}/make-responsible`)
  }

  async createDizDetails(proposalId: string, data: IDizDetails): Promise<IDizDetails> {
    const response = await this.apiClient.post(`${this.basePath}/${proposalId}/diz-details`, data)
    return response.data
  }

  async updateDizDetails(proposalId: string, dizDetailsId: string, data: IDizDetails): Promise<IDizDetails> {
    const response = await this.apiClient.put(`${this.basePath}/${proposalId}/diz-details/${dizDetailsId}`, data)
    return response.data
  }

  async exportAllUploadsAsZip(proposalId: string): Promise<void> {
    try {
      const response = await this.apiClient.post(
        `${this.basePath}/${proposalId}/uploads/export`,
        {},
        { responseType: 'blob' },
      )

      if (response.status === 200) {
        const url = window.URL.createObjectURL(new Blob([response.data]))

        const contentDisposition = response.headers['content-disposition'] || response.headers['Content-Disposition']
        const xFilename = response.headers['x-filename'] || response.headers['X-Filename']

        let filename = 'proposal-uploads.zip'

        if (xFilename) {
          filename = xFilename
        } else if (contentDisposition) {
          // Try RFC 5987 format first: filename*=UTF-8''encoded-filename
          const rfc5987Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/)
          if (rfc5987Match && rfc5987Match[1]) {
            filename = decodeURIComponent(rfc5987Match[1])
          } else {
            const standardMatch = contentDisposition.match(/filename="?([^"]+)"?/)
            if (standardMatch && standardMatch[1]) {
              filename = standardMatch[1]
            }
          }
        }
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      } else {
        throw new Error('Could not export proposal uploads')
      }
    } catch (error: any) {
      if (error.response) {
        const status = error.response.status
        let errorData = error.response.data
        if (errorData instanceof Blob) {
          try {
            const text = await errorData.text()
            errorData = JSON.parse(text)
          } catch (parseError) {
            console.warn('Could not parse error response as JSON:', parseError)
          }
        }
        const errorMessage = errorData?.message || errorData?.error || `Export failed with status ${status}`
        throw new Error(errorMessage)
      } else {
        throw new Error(error.message || 'An unexpected error occurred while exporting files')
      }
    }
  }
  async downloadLocationCsv(proposalId: string): Promise<void> {
    const response = await this.apiClient.get(`${this.basePath}/${proposalId}/locations/csv`)

    if (response.status === 200) {
      const { downloadUrl, filename } = response.data

      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = filename
      a.target = '_blank'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } else {
      throw new Error('Could not generate location CSV download link')
    }
  }

  async registerDataDeliveryRequestAtDms(proposalId: string, dmsId: string): Promise<IDataDelivery> {
    try {
      return (
        await this.apiClient.post<
          IDataDelivery,
          AxiosResponse<IDataDelivery>,
          Omit<IDataDelivery, 'updatedAt' | 'createdAt'>
        >(`${this.basePath}/${proposalId}/data-delivery`, {
          dataManagementSite: dmsId,
          acceptance: DeliveryAcceptance.PENDING,
          delivery: null,
        })
      ).data
    } catch (error: any) {
      throw new Error(error)
    }
  }

  async updateDmsForDataDelivery(proposalId: string, dmsId: string): Promise<IDataDelivery> {
    try {
      return (
        await this.apiClient.put<
          IDataDelivery,
          AxiosResponse<IDataDelivery>,
          Omit<IDataDelivery, 'updatedAt' | 'createdAt'>
        >(`${this.basePath}/${proposalId}/data-delivery`, {
          dataManagementSite: dmsId,
          acceptance: DeliveryAcceptance.PENDING,
        })
      ).data
    } catch (error: any) {
      throw new Error(error)
    }
  }

  async updateDmsAcceptanceForDataDelivery(
    proposalId: string,
    dmsId: string,
    acceptance: DeliveryAcceptance,
  ): Promise<IDataDelivery> {
    try {
      return (
        await this.apiClient.put<
          IDataDelivery,
          AxiosResponse<IDataDelivery>,
          Omit<IDataDelivery, 'updatedAt' | 'createdAt'>
        >(`${this.basePath}/${proposalId}/data-delivery`, {
          dataManagementSite: dmsId,
          acceptance,
        })
      ).data
    } catch (error: any) {
      throw new Error(error)
    }
  }

  async updateProjectAssignee(proposalId: string, projectAssignee?: IProjectAssignee): Promise<void> {
    await this.apiClient.put(`${this.basePath}/${proposalId}/assignee`, { projectAssignee })
  }

  async catch(error: any) {
    if (error.response) {
      const status = error.response.status
      let errorData = error.response.data
      if (errorData instanceof Blob) {
        try {
          const text = await errorData.text()
          errorData = JSON.parse(text)
        } catch (parseError) {
          console.warn('Could not parse error response as JSON:', parseError)
        }
      }
      const errorMessage = errorData?.message || errorData?.error || `Export failed with status ${status}`
      throw new Error(errorMessage)
    } else {
      throw new Error(error.message || 'An unexpected error occurred while exporting files')
    }
  }
}
