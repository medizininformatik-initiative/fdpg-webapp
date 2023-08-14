export const mockGetAll = vi.fn()
export const mockCreate = vi.fn()
export const mockGet = vi.fn()
export const mockUpdate = vi.fn()
export const mockUpdateStatus = vi.fn()
export const mockDelete = vi.fn()
export const mockUpdateLockingState = vi.fn()
export const mockSetUacVote = vi.fn()
export const mockMarkUacConditionAsAccepted = vi.fn()
export const mockSetDizApproval = vi.fn()
export const mockSignContract = vi.fn()
export const mockInitContracting = vi.fn()
export const mockUploadFile = vi.fn()
export const mockRemoveFile = vi.fn()
export const mockGetDownloadUrl = vi.fn()
export const mockGetResearcherInfo = vi.fn()
export const mockDeleteProposal = vi.fn()
export const mockDuplicate = vi.fn()
export const mockCheckUnique = vi.fn()
export const mockMarkSectionAsDone = vi.fn()
export const mockCreatePublication = vi.fn()
export const mockUpdatePublication = vi.fn()
export const mockDeletePublication = vi.fn()
export const mockGetReports = vi.fn()
export const mockGetReportContent = vi.fn()
export const mockCreateReport = vi.fn()
export const mockUpdateReport = vi.fn()
export const mockDeleteReport = vi.fn()
export const mockUpdateFdpgChecklist = vi.fn()
export const mockUpdateFdpgCheckNotes = vi.fn()
export const ProposalService = vi.fn().mockImplementation(() => ({
  getAll: mockGetAll,
  create: mockCreate,
  get: mockGet,
  update: mockUpdate,
  updateStatus: mockUpdateStatus,
  updateLockingState: mockUpdateLockingState,
  delete: mockDelete,
  setUacVote: mockSetUacVote,
  markUacConditionAsAccepted: mockMarkUacConditionAsAccepted,
  setDizApproval: mockSetDizApproval,
  signContract: mockSignContract,
  initContracting: mockInitContracting,
  uploadFile: mockUploadFile,
  removeFile: mockRemoveFile,
  getDownloadUrl: mockGetDownloadUrl,
  getResearcherInfo: mockGetResearcherInfo,
  deleteProposal: mockDeleteProposal,
  duplicate: mockDuplicate,
  checkUnique: mockCheckUnique,
  markSectionAsDone: mockMarkSectionAsDone,
  createPublication: mockCreatePublication,
  updatePublication: mockUpdatePublication,
  deletePublication: mockDeletePublication,
  getReports: mockGetReports,
  getReportContent: mockGetReportContent,
  createReport: mockCreateReport,
  updateReport: mockUpdateReport,
  deleteReport: mockDeleteReport,
  updateFdpgChecklist: mockUpdateFdpgChecklist,
  updateFdpgCheckNotes: mockUpdateFdpgCheckNotes,
}))
