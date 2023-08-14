const mockFetch = vi.fn()
const mockCreateProposal = vi.fn()
const mockSetCurrentProposal = vi.fn()
const mockUpdateProposal = vi.fn()
const mockUpdateProposalStatus = vi.fn()
const mockUpdateLockingState = vi.fn()
const mockSetUacVote = vi.fn()
const mockMarkUacConditionAsAccepted = vi.fn()
const mockSetDizApproval = vi.fn()
const mockSignContract = vi.fn()
const mockUploadFile = vi.fn()
const mockRemoveUpload = vi.fn()
const mockGetDownloadUrl = vi.fn()
const mockGetResearcherInfo = vi.fn()
const mockDeleteProposal = vi.fn()
const mockDuplicateProposal = vi.fn()
const mockCheckUnique = vi.fn()
const mockUpdateFdpgChecklist = vi.fn()
const mockMarkSectionAsDone = vi.fn()
const mockSetSortField = vi.fn()
const mockToggleSortDirection = vi.fn()
const mockCreateProposalPublication = vi.fn()

export const useProposalStore = vi.fn().mockImplementation(() => ({
  proposals: {},
  currentProposal: undefined,
  counts: {},
  _checkListLastSuccess: {},

  //Actions
  fetch: mockFetch,
  createProposal: mockCreateProposal,
  setCurrentProposal: mockSetCurrentProposal,
  updateProposal: mockUpdateProposal,
  updateLockingState: mockUpdateLockingState,
  updateProposalStatus: mockUpdateProposalStatus,
  setUacVote: mockSetUacVote,
  markUacConditionAsAccepted: mockMarkUacConditionAsAccepted,
  setDizApproval: mockSetDizApproval,
  signContract: mockSignContract,
  uploadFile: mockUploadFile,
  removeUpload: mockRemoveUpload,
  getDownloadUrl: mockGetDownloadUrl,
  getResearcherInfo: mockGetResearcherInfo,
  deleteProposal: mockDeleteProposal,
  duplicateProposal: mockDuplicateProposal,
  checkUnique: mockCheckUnique,
  updateFdpgChecklist: mockUpdateFdpgChecklist,
  markSectionAsDone: mockMarkSectionAsDone,
  setSortField: mockSetSortField,
  toggleSortDirection: mockToggleSortDirection,
  createProposalPublication: mockCreateProposalPublication,
}))
