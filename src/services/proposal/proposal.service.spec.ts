import { PanelQuery } from './../../types/sort-filter.types'
import { ApiClient } from '@/httpClients/api/api.client'
import type { AxiosInstance } from 'axios'
import { ProposalService } from './proposal.service'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import { createTestingPinia } from '@pinia/testing'
import { setActivePinia } from 'pinia'
import type { IFdpgChecklist, IPublicationCreateAndUpdate, IReportCreate, IReportUpdate } from '@/types/proposal.types'
import { ProposalStatus } from '@/types/proposal.types'
import type { IDeclineUacApproval, IUacApproval } from '@/types/uac-approval.types'
import type { DizApprovalDecision } from '@/types/diz-approval.types'
import type { IDeclineContract, ISignContract } from '@/types/sign-contract.types'
import { DirectUpload } from '@/types/upload.types'
import type { MockedObject } from 'vitest'
import type { MiiLocation } from '@/types/location.enum'

vi.mock('@/httpClients/api/api.client')

const mockGetAllResponse = {
  data: 'Hello World',
}

describe('ProposalService', () => {
  setActivePinia(createTestingPinia())
  let proposalStore: MockedObject<ReturnType<typeof useProposalStore>>

  let service: ProposalService
  let apiClient: MockedObject<AxiosInstance>
  const basePath = '/proposals'

  beforeEach(() => {
    apiClient = new ApiClient().client as MockedObject<AxiosInstance>
    vi.clearAllMocks()
    service = new ProposalService()
    proposalStore = vi.mocked(useProposalStore())
  })

  describe('GetAll', () => {
    it('should call the api client to get all proposal queries of the user', async () => {
      apiClient.get.mockResolvedValueOnce(mockGetAllResponse)
      const panelQuery = PanelQuery.Archived
      const response = await service.getAll({ panelQuery })
      expect(apiClient.get).toHaveBeenCalledWith(basePath, {
        params: { order: undefined, sortBy: undefined, panelQuery },
      })
      expect(response).toEqual(mockGetAllResponse.data)
    })
  })

  it('should call the api client to get proposal', async () => {
    apiClient.get.mockResolvedValueOnce(mockGetAllResponse)
    const proposalId = 'proposalId'
    const response = await service.get(proposalId)
    expect(apiClient.get).toHaveBeenCalledWith(`${basePath}/${proposalId}`)
    expect(response).toEqual(mockGetAllResponse.data)
  })

  it('should call the api client to create proposal', async () => {
    apiClient.post.mockResolvedValueOnce(mockGetAllResponse)
    const response = await service.create({ ...proposalStore.currentProposal })
    expect(apiClient.post).toHaveBeenCalledWith(`${basePath}`, { ...proposalStore.currentProposal })
    expect(response).toEqual(mockGetAllResponse.data)
  })

  it('should call the api client to update proposal', async () => {
    apiClient.put.mockResolvedValueOnce(mockGetAllResponse)
    const proposalId = 'proposalId'
    const response = await service.update(proposalId, { ...proposalStore.currentProposal })
    expect(apiClient.put).toHaveBeenCalledWith(`${basePath}/${proposalId}`, { ...proposalStore.currentProposal })
    expect(response).toEqual(mockGetAllResponse.data)
  })

  it('should call the api client to update status proposal', async () => {
    apiClient.put.mockResolvedValueOnce(mockGetAllResponse)
    const proposalId = 'proposalId'
    const status = ProposalStatus.Archived
    const response = await service.updateStatus(proposalId, status)
    expect(apiClient.put).toHaveBeenCalledWith(`${basePath}/${proposalId}/status`, { value: status })
    expect(response).toEqual(mockGetAllResponse.data)
  })

  it('should call the api client to update locking status proposal', async () => {
    apiClient.put.mockResolvedValueOnce(mockGetAllResponse)
    const proposalId = 'proposalId'
    const lockingState = true
    const response = await service.updateLockingState(proposalId, lockingState)
    expect(apiClient.put).toHaveBeenCalledWith(`${basePath}/${proposalId}/isLocked`, { value: lockingState })
    expect(response).toEqual(mockGetAllResponse.data)
  })

  it('should call the api client to set uac vote in proposal, decline version', async () => {
    apiClient.post.mockResolvedValueOnce(undefined)
    const UACDecline = { value: false, declineReason: 'string' } as IDeclineUacApproval
    const proposalId = 'proposalId'
    await service.setUacVote(proposalId, UACDecline)
    const formData = new FormData()
    formData.append('value', UACDecline.value.toString())
    formData.append('declineReason', UACDecline.declineReason)
    expect(apiClient.post).toHaveBeenCalledWith(`${basePath}/${proposalId}/uacApproval`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  })

  it('should call the api client to set uac vote in proposal, accept version', async () => {
    apiClient.post.mockResolvedValueOnce(undefined)
    const UACAccept = {
      value: true,
      dataAmount: 1,
      file: new File([new Blob(['1'], { type: 'image/png' })], 'test.png'),
    } as unknown as IUacApproval
    const proposalId = 'proposalId'
    await service.setUacVote(proposalId, UACAccept)
    const formData = new FormData()
    formData.append('value', UACAccept.value.toString())
    formData.append('file', UACAccept.file as Blob)
    formData.append('dataAmount', UACAccept.dataAmount.toString())
    expect(apiClient.post).toHaveBeenCalledWith(`${basePath}/${proposalId}/uacApproval`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  })

  it('should call the api client to mark uac condition as accepted in proposal', async () => {
    apiClient.put.mockResolvedValueOnce(mockGetAllResponse)
    const proposalId = 'proposalId'
    const conditionId = 'conditionId'
    const value = true
    const response = await service.markUacConditionAsAccepted(proposalId, conditionId, value)
    expect(apiClient.put).toHaveBeenCalledWith(`${basePath}/${proposalId}/uacApproval/${conditionId}/isAccepted`, {
      value,
    })
    expect(response).toEqual(mockGetAllResponse.data)
  })

  it('should call the api client to set diz approval in proposal', async () => {
    apiClient.post.mockResolvedValueOnce(undefined)
    const proposalId = 'proposalId'
    const decision = { value: true } as DizApprovalDecision
    await service.setDizApproval(proposalId, decision)
    expect(apiClient.post).toHaveBeenCalledWith(`${basePath}/${proposalId}/dizApproval`, decision)
  })

  it('should call the api client to sign contract in proposal, decline version', async () => {
    apiClient.post.mockResolvedValueOnce(mockGetAllResponse)
    const proposalId = 'proposalId'
    const decision = {
      value: false,
      declineReason: 'string',
    } as IDeclineContract
    const formData = new FormData()
    formData.append('value', decision.value.toString())
    formData.append('declineReason', decision.declineReason)
    const response = await service.signContract(proposalId, decision)
    expect(apiClient.post).toHaveBeenCalledWith(`${basePath}/${proposalId}/signContract`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    expect(response).toEqual(mockGetAllResponse.data)
  })

  it('should call the api client to sign contract in proposal, accept version', async () => {
    apiClient.post.mockResolvedValueOnce(mockGetAllResponse)
    const proposalId = 'proposalId'
    const decision = {
      value: true,
      file: new File([new Blob(['1'], { type: 'image/png' })], 'test.png'),
    } as unknown as ISignContract
    const formData = new FormData()
    formData.append('value', decision.value.toString())
    formData.append('file', decision.file as Blob)
    const response = await service.signContract(proposalId, decision)
    expect(apiClient.post).toHaveBeenCalledWith(`${basePath}/${proposalId}/signContract`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    expect(response).toEqual(mockGetAllResponse.data)
  })

  it('should call the api client to init contracting in proposal', async () => {
    apiClient.put.mockResolvedValueOnce(mockGetAllResponse)
    const proposalId = 'proposalId'
    const file = new File([new Blob(['1'], { type: 'image/png' })], 'test.png')
    const formData = new FormData()
    const locations = ['MRI', 'KC'] as MiiLocation[]
    formData.append('file', file as Blob)
    formData.append('locations', JSON.stringify(locations))
    const response = await service.initContracting(proposalId, file, locations)
    expect(apiClient.put).toHaveBeenCalledWith(`${basePath}/${proposalId}/init-contracting`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    expect(response).toEqual(mockGetAllResponse.data)
  })

  it('should call the api client to upload file in proposal', async () => {
    apiClient.post.mockResolvedValueOnce(mockGetAllResponse)
    const proposalId = 'proposalId'
    const type = DirectUpload.EthicVote
    const file = new File([new Blob(['1'], { type: 'image/png' })], 'test.png')
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)
    const response = await service.uploadFile(proposalId, file, type)
    expect(apiClient.post).toHaveBeenCalledWith(`${basePath}/${proposalId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    expect(response).toEqual(mockGetAllResponse.data)
  })

  it('should call the api client to remove file from proposal', async () => {
    apiClient.delete.mockResolvedValueOnce(mockGetAllResponse)
    const proposalId = 'proposalId'
    const uploadId = 'uploadId'
    const response = await service.removeFile(proposalId, uploadId)
    expect(apiClient.delete).toHaveBeenCalledWith(`${basePath}/${proposalId}/upload/${uploadId}`)
    expect(response).toEqual(mockGetAllResponse)
  })

  it('should call the api client to get download url from proposal', async () => {
    apiClient.get.mockResolvedValueOnce(mockGetAllResponse)
    const proposalId = 'proposalId'
    const uploadId = 'uploadId'
    const response = await service.getDownloadUrl(proposalId, uploadId)
    expect(apiClient.get).toHaveBeenCalledWith(`${basePath}/${proposalId}/upload/${uploadId}`)
    expect(response).toEqual(mockGetAllResponse.data)
  })

  it('should call the api client to get research info from proposal', async () => {
    apiClient.get.mockResolvedValueOnce(mockGetAllResponse)
    const proposalId = 'proposalId'
    const response = await service.getResearcherInfo(proposalId)
    expect(apiClient.get).toHaveBeenCalledWith(`${basePath}/${proposalId}/researcherInfo`)
    expect(response).toEqual(mockGetAllResponse.data)
  })

  it('should call the api client to delete proposal', async () => {
    apiClient.delete.mockResolvedValueOnce(mockGetAllResponse)
    const proposalId = 'proposalId'
    const response = await service.delete(proposalId)
    expect(apiClient.delete).toHaveBeenCalledWith(`${basePath}/${proposalId}`)
    expect(response).toEqual(mockGetAllResponse.data)
  })

  it('should call the api client to duplicate proposal', async () => {
    apiClient.post.mockResolvedValueOnce(mockGetAllResponse)
    const proposalId = 'proposalId'
    const response = await service.duplicate(proposalId)
    expect(apiClient.post).toHaveBeenCalledWith(`${basePath}/${proposalId}/duplicate`)
    expect(response).toEqual(mockGetAllResponse.data)
  })

  it('should call the api client to check being unique proposal', async () => {
    apiClient.post.mockResolvedValueOnce(mockGetAllResponse)
    const proposalId = 'proposalId'
    const projectAbbreviation = 'projectAbbr'
    const response = await service.checkUnique(projectAbbreviation, proposalId)
    expect(apiClient.post).toHaveBeenCalledWith(
      `${basePath}/is-unique`,
      { projectAbbreviation },
      { params: { id: proposalId } },
    )
    expect(response).toEqual(mockGetAllResponse.data)
  })

  it('should call the api client to update fdpg checklist proposal', async () => {
    apiClient.put.mockResolvedValueOnce(undefined)
    const proposalId = 'proposalId'
    const checklist = {
      isRegistrationLinkSent: true,
      isUnique: true,
      isAttachmentsChecked: true,
      isChecked: true,
    } as IFdpgChecklist
    await service.updateFdpgChecklist(proposalId, checklist)
    expect(apiClient.put).toHaveBeenCalledWith(`${basePath}/${proposalId}/fdpg-checklist`, checklist)
  })

  it('should call the api client to mark section as done proposal', async () => {
    apiClient.put.mockResolvedValueOnce(undefined)
    const proposalId = 'proposalId'
    const sectionId = 'sectionId'
    const value = true
    await service.markSectionAsDone(proposalId, sectionId, value)
    expect(apiClient.put).toHaveBeenCalledWith(`${basePath}/${proposalId}/${sectionId}/isDone`, { value })
  })

  it('should call the api client to create publication for proposal', async () => {
    apiClient.post.mockResolvedValueOnce(mockGetAllResponse)
    const proposalId = 'proposalId'
    const publication = {
      title: 'string',
      doi: 'string',
      link: 'string',
    } as IPublicationCreateAndUpdate
    const response = await service.createPublication(proposalId, publication)
    expect(apiClient.post).toHaveBeenCalledWith(`${basePath}/${proposalId}/publications`, publication)
    expect(response).toEqual(mockGetAllResponse.data)
  })

  it('should call the api client to delete publication from proposal', async () => {
    apiClient.delete.mockResolvedValueOnce(undefined)
    const proposalId = 'proposalId'
    const publicationId = 'publicationId'
    await service.deletePublication(proposalId, publicationId)
    expect(apiClient.delete).toHaveBeenCalledWith(`${basePath}/${proposalId}/publications/${publicationId}`)
  })

  it('should call the api client to update publication in proposal', async () => {
    apiClient.put.mockResolvedValueOnce(mockGetAllResponse)
    const proposalId = 'proposalId'
    const publication = {
      title: 'string',
      doi: 'string',
      link: 'string',
    } as IPublicationCreateAndUpdate
    const publicationId = 'publicationId'
    const response = await service.updatePublication(proposalId, publicationId, publication)
    expect(apiClient.put).toHaveBeenCalledWith(`${basePath}/${proposalId}/publications/${publicationId}`, publication)
    expect(response).toEqual(mockGetAllResponse.data)
  })

  it('should call the api client to create report for proposal', async () => {
    apiClient.post.mockResolvedValueOnce(mockGetAllResponse)
    const proposalId = 'proposalId'
    const form = new FormData()

    const report = {
      _id: 'string',
      createdAt: 'string',
      updatedAt: 'string',
      uploads: [],
      files: [new Blob(['1'])],
    } as unknown as IReportCreate
    report.files.forEach((file) => {
      form.append('files', file as Blob)
    })
    form.append('content', report.content)
    form.append('title', report.title)
    const response = await service.createReport(proposalId, report)
    expect(apiClient.post).toHaveBeenCalledWith(`${basePath}/${proposalId}/reports`, form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    expect(response).toEqual(mockGetAllResponse.data)
  })

  it('should call the api client to delete report from proposal', async () => {
    apiClient.delete.mockResolvedValueOnce(undefined)
    const proposalId = 'proposalId'
    const reportId = 'reportId'
    await service.deleteReport(proposalId, reportId)
    expect(apiClient.delete).toHaveBeenCalledWith(`${basePath}/${proposalId}/reports/${reportId}`)
  })

  it('should call the api client to update report in proposal', async () => {
    apiClient.put.mockResolvedValueOnce(mockGetAllResponse)
    const proposalId = 'proposalId'
    const form = new FormData()

    const report = {
      _id: 'string',
      createdAt: 'string',
      updatedAt: 'string',
      uploads: [],
      files: [new Blob(['1'])],
      keepUploads: [],
    } as unknown as IReportUpdate
    const reportId = 'reportId'
    report.files.forEach((file) => {
      form.append('files', file as Blob)
    })
    form.append('content', report.content)
    form.append('title', report.title)
    form.append('keepUploads', report.keepUploads.join(','))

    const response = await service.updateReport(proposalId, reportId, report)
    expect(apiClient.put).toHaveBeenCalledWith(`${basePath}/${proposalId}/reports/${reportId}`, form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    expect(response).toEqual(mockGetAllResponse.data)
  })

  it('should call the api client to get reports for proposal', async () => {
    apiClient.get.mockResolvedValueOnce(mockGetAllResponse)
    const proposalId = 'proposalId'
    const response = await service.getReports(proposalId)
    expect(apiClient.get).toHaveBeenCalledWith(`${basePath}/${proposalId}/reports`)
    expect(response).toEqual(mockGetAllResponse.data)
  })

  it('should call the api client to get report content of proposal', async () => {
    apiClient.get.mockResolvedValueOnce(mockGetAllResponse)
    const proposalId = 'proposalId'
    const reportId = 'reportId'
    const response = await service.getReportContent(proposalId, reportId)
    expect(apiClient.get).toHaveBeenCalledWith(`${basePath}/${proposalId}/reports/${reportId}/content`)
    expect(response).toEqual(mockGetAllResponse.data)
  })

  it('should call the api client to set fdpg check notes in proposal', async () => {
    apiClient.put.mockResolvedValueOnce(undefined)
    const proposalId = 'proposalId'
    const text = 'text'
    await service.updateFdpgCheckNotes(proposalId, text)
    expect(apiClient.put).toHaveBeenCalledWith(`${basePath}/${proposalId}/fdpgCheckNotes`, { value: text })
  })
})
