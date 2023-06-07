export const mockCreate = vi.fn()
export const mockUpdateProfile = vi.fn()
export const mockResendInvitation = vi.fn()
export const mockResetPassword = vi.fn()
export const UserService = vi.fn().mockImplementation(() => ({
  create: mockCreate,
  updateProfile: mockUpdateProfile,
  resendInvitation: mockResendInvitation,
  resetPassword: mockResetPassword,
}))
