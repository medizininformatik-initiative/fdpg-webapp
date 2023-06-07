import { UserService } from '@/services/user/user.service'
import type { IResearcherIdentity} from '@/types/proposal.types';
import { ParticipantType } from '@/types/proposal.types'
import { Salutation } from '@/types/salutation.enum'
import type { IUpdateUser } from '@/types/user.types'
import { createPinia, setActivePinia } from 'pinia'
import { useUserStore } from './user.store'

vi.mock('@/services/user/user.service')

const userService = vi.mocked(new UserService())

describe('User Store', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
  })

  it('renders', () => {
    const store = useUserStore()
    expect(store).toBeTruthy()
  })

  it('should create user', async () => {
    const store = useUserStore()
    const user = {
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
    } as IResearcherIdentity
    await store.create(user)
    expect(userService.create).toHaveBeenCalledWith(user)
  })

  it('should update profile', async () => {
    const store = useUserStore()
    const user = {
      salutation: Salutation.Female,
      title: 'string',
      firstName: 'string',
      lastName: 'string',
      email: 'string',
      affiliation: 'string',
    } as IUpdateUser
    const userId = 'userId'
    await store.updateProfile(userId, user)
    expect(userService.updateProfile).toHaveBeenCalledWith(userId, user)
  })

  it('should resend invitation', async () => {
    const store = useUserStore()
    const email = 'email'
    await store.resendInvitation(email)
    expect(userService.resendInvitation).toHaveBeenCalledWith(email)
  })

  it('should reset password', async () => {
    const store = useUserStore()
    const userId = 'userId'
    await store.resetPassword(userId)
    expect(userService.resetPassword).toHaveBeenCalledWith(userId)
  })
})
