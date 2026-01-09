import { mockProposalDetail, mockProposal, getMockProposal } from '@/mocks/proposal.mock'
import { ProposalService } from '@/services/proposal/proposal.service'
import { createPinia, setActivePinia } from 'pinia'
import { useProposalStore } from './proposal.store'
import type { ISortAndOrderBy } from '@/types/sort-filter.types'
import { PanelQuery, SortDirection } from '@/types/sort-filter.types'
import { transformForm } from '@/utils/form-transform'
import type {
  IProposal,
  IPublicationCreateAndUpdate,
  IPublicationGet,
  IReportCreate,
  IResearcherIdentity,
  IUpload,
  IReportUpdate,
  IReportGet,
  IFdpgChecklist,
  FdpgChecklistItemUpdateResponse,
} from '@/types/proposal.types'
import { ParticipantType, ProposalStatus } from '@/types/proposal.types'
import type { IDeclineUacApproval } from '@/types/uac-approval.types'
import type { IDizApproval } from '@/types/diz-approval.types'
import type { IDeclineContract } from '@/types/sign-contract.types'
import { DirectUpload, UseCaseUpload } from '@/types/upload.types'
import { NoErrorThrownError, getError } from '@/__test__/get-error'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { DueDateEnum, type Deadlines } from '@/types/due-date.enum'

const mockServiceInstance = {
  getAll: vi.fn(),
  get: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  updateStatus: vi.fn(),
  updateLockingState: vi.fn(),
  getStatistics: vi.fn(),
  uploadFile: vi.fn(),
  deleteUpload: vi.fn(),
  getResearcherInfo: vi.fn(),
  deleteProposal: vi.fn(),
  duplicateProposal: vi.fn(),
  checkUnique: vi.fn(),
  markSectionAsDone: vi.fn(),
  createPublication: vi.fn(),
  updatePublication: vi.fn(),
  deletePublication: vi.fn(),
  getReports: vi.fn(),
  getReportContent: vi.fn(),
  createReport: vi.fn(),
  updateReport: vi.fn(),
  deleteReport: vi.fn(),
  updateFdpgChecklist: vi.fn(),
  updateFdpgCheckNotes: vi.fn(),
  getProposalPdfFile: vi.fn(),
  updateDeadlines: vi.fn(),
  markUacConditionAsAccepted: vi.fn(),
  setUacVote: vi.fn(),
  setDizApproval: vi.fn(),
  setDizConditionApproval: vi.fn(),
  signContract: vi.fn(),
  initContracting: vi.fn(),
  updateContracting: vi.fn(),
  removeFile: vi.fn(),
  getDownloadUrl: vi.fn(),
  delete: vi.fn(),
  duplicate: vi.fn(),
}

vi.mock('@/services/proposal/proposal.service', () => ({
  ProposalService: vi.fn(() => mockServiceInstance),
}))

const proposalService = mockServiceInstance

describe('Proposal Store', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  it('renders', () => {
    const store = useProposalStore()
    expect(store).toBeTruthy()
  })

  describe('GetAll', () => {
    it('should call the service to get all proposals', async () => {
      const store = useProposalStore()
      proposalService.getAll.mockResolvedValueOnce([mockProposalDetail])
      await store.fetch({ panelQuery: PanelQuery.Archived } as ISortAndOrderBy<any>)
      expect(proposalService.getAll).toHaveBeenCalledWith({ panelQuery: PanelQuery.Archived } as ISortAndOrderBy<any>)
      expect(store.proposals).toEqual({ [PanelQuery.Archived]: [mockProposalDetail] })
    })
  })

  describe('getStatistics', () => {
    it('should call the service to get statistics', async () => {
      const store = useProposalStore()
      const mockStatistics = {
        panels: {
          DRAFT: { critical: 1, high: 2, medium: 0, low: 5, total: 8 },
        },
        total: 8,
      }
      proposalService.getStatistics.mockResolvedValueOnce(mockStatistics)
      await store.getStatistics()
      expect(proposalService.getStatistics).toHaveBeenCalled()
      expect(store.statistics).toEqual(mockStatistics)
    })
  })

  it('should call the service to create a proposal', async () => {
    const store = useProposalStore()
    proposalService.create.mockResolvedValueOnce(mockProposal)
    await store.createProposal(mockProposal)
    expect(proposalService.create).toHaveBeenCalledWith(mockProposal)
  })

  it('should call the service to set current proposal', async () => {
    const store = useProposalStore()
    proposalService.get.mockResolvedValueOnce(mockProposal)
    const proposalId = 'proposalId'
    await store.setCurrentProposal(proposalId)
    expect(proposalService.get).toHaveBeenCalledWith(proposalId)
    expect(store.currentProposal).toEqual(transformForm(mockProposal) as IProposal)
  })

  it('should call the service to set current proposal to nothing', async () => {
    const store = useProposalStore()
    proposalService.get.mockResolvedValueOnce(mockProposal)
    await store.setCurrentProposal()
    expect(store.currentProposal).toEqual(transformForm() as IProposal)
  })

  it('should call the service to update proposal', async () => {
    const store = useProposalStore()
    proposalService.update.mockResolvedValueOnce(mockProposal)
    const proposalId = 'proposalId'
    await store.updateProposal(proposalId, mockProposal)
    expect(proposalService.update).toHaveBeenCalledWith(proposalId, mockProposal)
  })

  it('should call the service to update proposal status', async () => {
    const store = useProposalStore()
    proposalService.updateStatus.mockResolvedValueOnce(mockProposal)
    const status = ProposalStatus.Archived
    const proposalId = 'proposalId'
    await store.updateProposalStatus(proposalId, status)
    expect(proposalService.updateStatus).toHaveBeenCalledWith(proposalId, status)
  })

  it('should call the service to update proposal locking state', async () => {
    const store = useProposalStore()
    proposalService.updateLockingState.mockResolvedValueOnce(mockProposal)
    const lockingState = true
    const proposalId = 'proposalId'
    await store.updateLockingState(proposalId, lockingState)
    expect(proposalService.updateLockingState).toHaveBeenCalledWith(proposalId, lockingState)
  })

  it('should call the service to setUacVote', async () => {
    const store = useProposalStore()
    const decision = { value: false, declineReason: 'string' } as IDeclineUacApproval
    const proposalId = 'proposalId'
    await store.setUacVote(proposalId, decision)
    expect(proposalService.setUacVote).toHaveBeenCalledWith(proposalId, decision)
  })

  it('should call the service to markUacConditionAsAccepted', async () => {
    const store = useProposalStore()
    proposalService.markUacConditionAsAccepted.mockResolvedValue(mockProposal)
    const conditionId = 'conditionId'
    const proposalId = 'proposalId'
    await store.markUacConditionAsAccepted(proposalId, conditionId, true)
    expect(proposalService.markUacConditionAsAccepted).toHaveBeenCalledWith(proposalId, conditionId, true)
  })

  it('should call the service to markUacConditionAsAccepted in current proposal', async () => {
    const store = useProposalStore()
    store.currentProposal = getMockProposal()
    proposalService.markUacConditionAsAccepted.mockResolvedValueOnce(mockProposal)
    const conditionId = 'conditionId'
    const proposalId = '630dd9e8c8a548d21ef4c356'
    await store.markUacConditionAsAccepted(proposalId, conditionId, true)
    expect(proposalService.markUacConditionAsAccepted).toHaveBeenCalledWith(proposalId, conditionId, true)
    expect(store.currentProposal).toEqual(mockProposal)
  })

  it('should call the service to set diz approval', async () => {
    const store = useProposalStore()
    const decision = { value: true } as IDizApproval
    const proposalId = 'proposalId'
    await store.setDizApproval(proposalId, decision)
    expect(proposalService.setDizApproval).toHaveBeenCalledWith(proposalId, decision)
  })

  it('should call the service to sign contract', async () => {
    const store = useProposalStore()
    proposalService.signContract.mockResolvedValueOnce(mockProposal)
    const decision = {
      value: false,
      declineReason: 'string',
    } as IDeclineContract
    const proposalId = 'proposalId'
    await store.signContract(proposalId, decision)
    expect(proposalService.signContract).toHaveBeenCalledWith(proposalId, decision)
  })

  it('should call the service to init contracting', async () => {
    const store = useProposalStore()
    proposalService.initContracting.mockResolvedValueOnce(mockProposal)
    const file = new File([new Blob(['1'], { type: 'image/png' })], 'test.png')
    const proposalId = 'proposalId'
    await store.initContracting(proposalId, file, ['MRI', 'KC'])
    expect(proposalService.initContracting).toHaveBeenCalledWith(proposalId, file, ['MRI', 'KC'])
  })

  it('should call the service to uploadFile', async () => {
    const store = useProposalStore()
    store.currentProposal = getMockProposal()
    proposalService.uploadFile.mockResolvedValueOnce({
      fileName: 'string',
      fileSize: 3,
      type: DirectUpload.EthicVote,
      createdAt: 'string',
      _id: 'string',
    } as IUpload)
    const file = new File([new Blob(['1'], { type: 'image/png' })], 'test.png')
    const proposalId = 'proposalId'
    await store.uploadFile(proposalId, file, DirectUpload.EthicVote)
    expect(proposalService.uploadFile).toHaveBeenCalledWith(proposalId, file, DirectUpload.EthicVote)
    const uploads = mockProposal.uploads || []
    uploads.push({
      fileName: 'string',
      fileSize: 3,
      type: DirectUpload.EthicVote,
      createdAt: 'string',
      _id: 'string',
    } as IUpload)
    expect(store.currentProposal.uploads).toEqual(uploads)
  })

  it('should call the service to removeUpload', async () => {
    const store = useProposalStore()
    store.currentProposal = getMockProposal()
    const uploadId = 'UploadId1'
    const proposalId = 'proposalId'
    await store.removeUpload(proposalId, uploadId)
    let uploads = mockProposal.uploads || []
    uploads = uploads.filter((upload) => upload._id !== uploadId)
    expect(proposalService.removeFile).toHaveBeenCalledWith(proposalId, uploadId)
    expect(store.currentProposal.uploads).toEqual(uploads)
  })

  it('should call the service multiple times to remove uploads', async () => {
    const store = useProposalStore()
    store.currentProposal = getMockProposal()
    const uploadId1 = 'UploadId1'
    const uploadId2 = 'UploadId2'
    const proposalId = '630dd9e8c8a548d21ef4c356'

    const lengthBefore = mockProposal.uploads?.length || 0

    await store.removeUploads(proposalId, [uploadId1, uploadId2])
    expect(proposalService.removeFile).toHaveBeenCalledWith(proposalId, uploadId1)
    expect(proposalService.removeFile).toHaveBeenCalledWith(proposalId, uploadId2)
    expect(store.currentProposal.uploads?.length).toEqual(lengthBefore - 2)
  })

  it('should call the service multiple times to remove uploads - with fails', async () => {
    const store = useProposalStore()
    store.currentProposal = getMockProposal()
    const uploadId1 = 'UploadId1'
    const uploadId2 = 'UploadId2'
    const proposalId = '630dd9e8c8a548d21ef4c356'

    const lengthBefore = mockProposal.uploads?.length || 0

    proposalService.removeFile.mockRejectedValueOnce('error')

    const call = store.removeUploads(proposalId, [uploadId1, uploadId2])
    const error = await getError(async () => await call)

    expect(error).toBeDefined()
    expect(error).not.toBeInstanceOf(NoErrorThrownError)

    expect(proposalService.removeFile).toHaveBeenCalledWith(proposalId, uploadId1)
    expect(proposalService.removeFile).toHaveBeenCalledWith(proposalId, uploadId2)
    expect(store.currentProposal.uploads?.length).toEqual(lengthBefore - 1)
  })

  it('should call the service to getDownloadUrl', async () => {
    const store = useProposalStore()
    proposalService.getDownloadUrl.mockResolvedValueOnce('string')
    const uploadId = 'uploadId'
    const proposalId = 'proposalId'
    await store.getDownloadUrl(proposalId, uploadId)
    expect(proposalService.getDownloadUrl).toHaveBeenCalledWith(proposalId, uploadId)
  })

  it('should call the service to uploadFile for proposal that is empty of uploads', async () => {
    const store = useProposalStore()
    store.currentProposal = getMockProposal()
    store.currentProposal.uploads = undefined
    proposalService.uploadFile.mockResolvedValueOnce({
      fileName: 'string',
      fileSize: 3,
      type: DirectUpload.EthicVote,
      createdAt: 'string',
      _id: 'string',
    } as IUpload)
    const file = new File([new Blob(['1'], { type: 'image/png' })], 'test.png')
    const proposalId = 'proposalId'
    await store.uploadFile(proposalId, file, DirectUpload.EthicVote)
    expect(proposalService.uploadFile).toHaveBeenCalledWith(proposalId, file, DirectUpload.EthicVote)
    const uploads = [
      {
        fileName: 'string',
        fileSize: 3,
        type: DirectUpload.EthicVote,
        createdAt: 'string',
        _id: 'string',
      },
    ] as unknown as IUpload
    expect(store.currentProposal.uploads).toEqual(uploads)
  })

  it('should call the service to getResearcherInfo', async () => {
    const store = useProposalStore()
    proposalService.getResearcherInfo.mockResolvedValueOnce([
      {
        title: 'string',
        firstName: 'string',
        lastName: 'string',
        affiliation: 'string',
        email: 'string',
        isExisting: true,
        isEmailVerified: true,
        isRegistrationComplete: true,
        participantType: ParticipantType.AdditionalProjectLeader,
        username: 'string',
      },
    ] as IResearcherIdentity[])
    const proposalId = 'proposalId'
    await store.getResearcherInfo(proposalId)
    expect(proposalService.getResearcherInfo).toHaveBeenCalledWith(proposalId)
  })

  it('should call the service to deleteProposal', async () => {
    const store = useProposalStore()
    store.proposals = { [PanelQuery.Archived]: [mockProposalDetail] }
    const proposalId = 'proposalId'
    expect(store.proposals[PanelQuery.Archived]?.length).toEqual(1)
    await store.deleteProposal(proposalId, PanelQuery.Archived)
    expect(proposalService.delete).toHaveBeenCalledWith(proposalId)
    expect(store.proposals[PanelQuery.Archived]).toEqual([])
  })

  it('should call the service to duplicateProposal', async () => {
    const store = useProposalStore()
    proposalService.duplicate.mockResolvedValueOnce(mockProposal)
    const proposalId = 'proposalId'
    await store.duplicateProposal(proposalId)
    expect(proposalService.duplicate).toHaveBeenCalledWith(proposalId)
  })

  it('should call the service to checkUnique', async () => {
    const store = useProposalStore()
    proposalService.checkUnique.mockResolvedValueOnce(true)
    const proposalId = 'proposalId'
    const value = 'string'
    await store.checkUnique(value, proposalId)
    expect(proposalService.checkUnique).toHaveBeenCalledWith(value, proposalId)
  })

  it('should call the service to markSectionAsDone', async () => {
    const store = useProposalStore()
    const proposalId = 'proposalId'
    const sectionId = 'sectionId'
    const value = true
    await store.markSectionAsDone(proposalId, sectionId, value)
    expect(proposalService.markSectionAsDone).toHaveBeenCalledWith(proposalId, sectionId, value)
  })

  it('should set sort field', () => {
    const store = useProposalStore()
    store.currentSortField = 'submittedAt'
    store.setSortField('projectAbbreviation')
    expect(store.currentSortField).toEqual('projectAbbreviation')
  })

  it('should toggleSortDirection', () => {
    const store = useProposalStore()
    store.currentSortDirection = SortDirection.ASC
    store.toggleSortDirection()
    expect(store.currentSortDirection).toEqual(SortDirection.DESC)
  })

  it('should create a publication', async () => {
    const store = useProposalStore()
    store.currentProposal = getMockProposal()
    proposalService.createPublication.mockResolvedValueOnce([
      {
        title: 'string',
        doi: 'string',
        link: 'string',
        updatedAt: 'string',
        createdAt: 'string',
        _id: 'string',
      },
    ] as IPublicationGet[])
    const proposalId = '630dd9e8c8a548d21ef4c356'
    const publication = {
      title: 'string',
      doi: 'string',
      link: 'string',
    } as IPublicationCreateAndUpdate
    await store.createProposalPublication(proposalId, publication)
    expect(proposalService.createPublication).toHaveBeenCalledWith(proposalId, publication)
    expect(store.currentProposal.publications).toEqual([
      {
        title: 'string',
        doi: 'string',
        link: 'string',
        updatedAt: 'string',
        createdAt: 'string',
        _id: 'string',
      },
    ] as IPublicationGet[])
  })

  it('should update a publication', async () => {
    const store = useProposalStore()
    store.currentProposal = getMockProposal()
    proposalService.updatePublication.mockResolvedValueOnce([
      {
        title: 'string',
        doi: 'string',
        link: 'string',
        updatedAt: 'string',
        createdAt: 'string',
        _id: 'string',
      },
    ] as IPublicationGet[])
    const proposalId = '630dd9e8c8a548d21ef4c356'
    const publicationId = ''
    const publication = {
      title: 'string',
      doi: 'string',
      link: 'string',
    } as IPublicationCreateAndUpdate
    await store.updateProposalPublication(proposalId, publicationId, publication)
    expect(proposalService.updatePublication).toHaveBeenCalledWith(proposalId, publicationId, publication)
    expect(store.currentProposal.publications).toEqual([
      {
        title: 'string',
        doi: 'string',
        link: 'string',
        updatedAt: 'string',
        createdAt: 'string',
        _id: 'string',
      },
    ] as IPublicationGet[])
  })

  it('should delete a publication', async () => {
    const store = useProposalStore()

    store.currentProposal = getMockProposal()
    const proposalId = '630dd9e8c8a548d21ef4c356'
    const publicationId = 'publicationId'
    await store.deletePublication(proposalId, publicationId)
    expect(proposalService.deletePublication).toHaveBeenCalledWith(proposalId, publicationId)
    expect(store.currentProposal.publications).toEqual([] as IPublicationGet[])
  })

  it('should get reports', async () => {
    const store = useProposalStore()
    store.currentProposal = getMockProposal()
    proposalService.getReports.mockResolvedValueOnce(mockProposal.reports)
    const proposalId = '630dd9e8c8a548d21ef4c356'
    await store.getReports(proposalId)
    expect(proposalService.getReports).toHaveBeenCalledWith(proposalId)
    expect(store.currentProposal.reports).toEqual(mockProposal.reports)
  })

  it('should get reports content', async () => {
    const store = useProposalStore()
    proposalService.getReportContent.mockResolvedValueOnce('content')
    const proposalId = '630dd9e8c8a548d21ef4c356'
    const reportId = '1'
    await store.getReportContent(proposalId, reportId)
    expect(proposalService.getReportContent).toHaveBeenCalledWith(proposalId, reportId)
  })

  it('should create report', async () => {
    const store = useProposalStore()
    store.currentProposal = getMockProposal()
    proposalService.createReport.mockResolvedValueOnce({
      title: 't',
      content: 'c',
      _id: '1',
      createdAt: '',
      updatedAt: '',
      uploads: [
        {
          downloadUrl: 'string',
          _id: 'string',
          fileName: 'string',
          fileSize: 1,
          type: UseCaseUpload.ReportUpload,
          mimetype: '',
          createdAt: 'string',
        },
      ],
    } as IReportGet)
    const proposalId = '630dd9e8c8a548d21ef4c356'
    const report = {
      _id: 'string',
      createdAt: 'string',
      updatedAt: 'string',
      uploads: [],
      files: [new Blob(['1'])],
    } as unknown as IReportCreate
    await store.createProposalReport(proposalId, report)
    expect(proposalService.createReport).toHaveBeenCalledWith(proposalId, report)
  })

  it('should update report', async () => {
    const store = useProposalStore()
    store.currentProposal = getMockProposal()

    proposalService.updateReport.mockResolvedValueOnce({
      title: 'update',
      content: 'c',
      _id: '2',
      createdAt: '',
      updatedAt: '',
      uploads: [
        {
          downloadUrl: 'string',
          _id: 'string',
          fileName: 'string',
          fileSize: 1,
          type: UseCaseUpload.ReportUpload,
          mimetype: '',
          createdAt: 'string',
        },
      ],
    } as IReportGet)
    const proposalId = '630dd9e8c8a548d21ef4c356'
    const report = {
      _id: 'string',
      createdAt: 'string',
      updatedAt: 'string',
      uploads: [],
      files: [new Blob(['1'])],
      keepUploads: [],
    } as unknown as IReportUpdate
    const reportId = '1'
    await store.updateProposalReport(proposalId, reportId, report)
    expect(proposalService.updateReport).toHaveBeenCalledWith(proposalId, reportId, report)
  })

  it('should delete a report', async () => {
    const store = useProposalStore()
    store.currentProposal = getMockProposal()

    const proposalId = '630dd9e8c8a548d21ef4c356'
    const reportId = '1'
    await store.deleteReport(proposalId, reportId)

    expect(proposalService.deleteReport).toHaveBeenCalledWith(proposalId, reportId)
    expect(store.currentProposal.reports).toEqual([])
  })

  it('should update checklist isRegistrationLinkSent', async () => {
    const store = useProposalStore()
    store.currentProposal = getMockProposal()

    const checklistUpdate: Partial<IFdpgChecklist> = {
      isRegistrationLinkSent: false,
    }
    const mockResponse: FdpgChecklistItemUpdateResponse = {
      _id: 'isRegistrationLinkSent',
      isRegistrationLinkSent: false,
    }
    proposalService.updateFdpgChecklist.mockResolvedValueOnce(mockResponse)
    const updatePromise = store.updateFdpgChecklist('proposalId', checklistUpdate)

    await vi.advanceTimersByTime(500)
    await updatePromise

    expect(proposalService.updateFdpgChecklist).toHaveBeenCalledWith('proposalId', checklistUpdate)
    expect(store.currentProposal?.fdpgChecklist?.isRegistrationLinkSent).toBe(false)
  })

  it('should update checklist fdpgInternalCheckNotes', async () => {
    const store = useProposalStore()
    store.currentProposal = getMockProposal()

    const mockNote = 'test note'
    const checklistUpdate: Partial<IFdpgChecklist> = {
      fdpgInternalCheckNotes: mockNote,
    }
    const mockResponse: FdpgChecklistItemUpdateResponse = {
      _id: 'fdpgInternalCheckNotes',
      fdpgInternalCheckNotes: mockNote,
    }
    proposalService.updateFdpgChecklist.mockResolvedValueOnce(mockResponse)
    const updatePromise = store.updateFdpgChecklist('proposalId', checklistUpdate)

    await vi.advanceTimersByTime(500)
    await updatePromise

    expect(proposalService.updateFdpgChecklist).toHaveBeenCalledWith('proposalId', checklistUpdate)
    expect(store.currentProposal?.fdpgChecklist?.fdpgInternalCheckNotes).toEqual(mockNote)
  })

  it('should check the getter', async () => {
    const store = useProposalStore()
    store.proposals = { [PanelQuery.Archived]: [mockProposalDetail] }
    store.search = '  ShortCut  '
    expect(store.filteredProposal).toEqual({ ARCHIVED: [mockProposalDetail] })
    store.search = '  ownerName  '
    expect(store.filteredProposal).toEqual({ ARCHIVED: [mockProposalDetail] })
    store.search = '  projectTitle  '
    expect(store.filteredProposal).toEqual({ ARCHIVED: [mockProposalDetail] })
    store.search = ''
    expect(store.filteredProposal).toEqual(store.proposals)
  })

  it('should call the service to set diz approval', async () => {
    const store = useProposalStore()
    const text = 'text'
    const proposalId = 'proposalId'
    await store.updateFdpgCheckNotes(proposalId, text)
    expect(proposalService.updateFdpgCheckNotes).toHaveBeenCalledWith(proposalId, text)
  })

  it('should call the service to generate and download pdf proposal', async () => {
    const store = useProposalStore()
    const proposalId = 'proposalId'
    await store.getProposalPdfFile(proposalId)
    expect(proposalService.getProposalPdfFile).toHaveBeenCalledWith(proposalId)
  })

  it('should call the service to update deadlines and refresh current proposal', async () => {
    const store = useProposalStore()

    // Create a mock proposal with initial deadlines
    const initialProposal = getMockProposal()
    initialProposal.deadlines = {
      [DueDateEnum.DUE_DAYS_FDPG_CHECK]: '2024-01-01T08:00:00.000Z',
      [DueDateEnum.DUE_DAYS_LOCATION_CHECK]: '2024-01-10T08:00:00.000Z',
      [DueDateEnum.DUE_DAYS_LOCATION_CONTRACTING]: null,
      [DueDateEnum.DUE_DAYS_EXPECT_DATA_DELIVERY]: null,
      [DueDateEnum.DUE_DAYS_DATA_CORRUPT]: null,
      [DueDateEnum.DUE_DAYS_FINISHED_PROJECT]: null,
    } as Deadlines
    store.currentProposal = initialProposal

    // New deadlines to update
    const newDeadlines: Deadlines = {
      [DueDateEnum.DUE_DAYS_FDPG_CHECK]: '2024-03-20T08:00:00.000Z',
      [DueDateEnum.DUE_DAYS_LOCATION_CHECK]: '2024-03-25T08:00:00.000Z',
      [DueDateEnum.DUE_DAYS_LOCATION_CONTRACTING]: '2024-03-30T08:00:00.000Z',
      [DueDateEnum.DUE_DAYS_EXPECT_DATA_DELIVERY]: '2024-04-05T08:00:00.000Z',
      [DueDateEnum.DUE_DAYS_DATA_CORRUPT]: '2024-04-10T08:00:00.000Z',
      [DueDateEnum.DUE_DAYS_FINISHED_PROJECT]: '2024-04-15T08:00:00.000Z',
    }

    // Create an updated proposal that will be returned by the API
    const updatedProposal = { ...mockProposal }
    updatedProposal.deadlines = newDeadlines

    // Mock the API responses
    store.apiService.updateDeadlines = vi.fn().mockResolvedValue(undefined)
    store.apiService.get = vi.fn().mockResolvedValue(updatedProposal)

    const proposalId = 'test-proposal-id'

    // Call the method we're testing
    await store.updateDeadlines(proposalId, newDeadlines)

    // Verify API calls
    expect(store.apiService.updateDeadlines).toHaveBeenCalledWith(proposalId, newDeadlines)
    expect(store.apiService.get).toHaveBeenCalledWith(proposalId)

    // Verify that the current proposal was refreshed with new deadlines
    expect(store.currentProposal).toEqual(transformForm(updatedProposal) as IProposal)

    // Specifically check the deadlines
    if (store.currentProposal && updatedProposal.deadlines) {
      expect(store.currentProposal.deadlines).toEqual(updatedProposal.deadlines)

      // Check individual deadline values
      expect(store.currentProposal.deadlines[DueDateEnum.DUE_DAYS_FDPG_CHECK]).toBe(
        newDeadlines[DueDateEnum.DUE_DAYS_FDPG_CHECK],
      )

      expect(store.currentProposal.deadlines[DueDateEnum.DUE_DAYS_LOCATION_CHECK]).toBe(
        newDeadlines[DueDateEnum.DUE_DAYS_LOCATION_CHECK],
      )

      expect(store.currentProposal.deadlines[DueDateEnum.DUE_DAYS_LOCATION_CONTRACTING]).toBe(
        newDeadlines[DueDateEnum.DUE_DAYS_LOCATION_CONTRACTING],
      )
    }
  })
})
