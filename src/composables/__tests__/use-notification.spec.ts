import { proposalCountMock } from '@/mocks/proposal-counts.mock'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import { createTestingPinia } from '@pinia/testing'
import { setActivePinia } from 'pinia'
import useNotifications from '../use-notifications'
import { ElNotification } from 'element-plus'
import type { MockedObject } from 'vitest'

vi.mock('vue-i18n', () => ({
  useI18n: vi.fn().mockImplementation(() => ({
    t: vi.fn().mockImplementation((key: string) => key),
    locale: {
      value: 'de-DE',
    },
  })),
}))

vi.mock('element-plus', () => ({
  ElNotification: vi.fn().mockImplementation(() => ({})),
}))

describe('UseNotifications', () => {
  let proposalStore: MockedObject<ReturnType<typeof useProposalStore>>
  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createTestingPinia())
    vi.useFakeTimers()
    proposalStore = vi.mocked(useProposalStore())
    proposalStore.counts = proposalCountMock
  })

  it('should call notification function if something is wrong', () => {
    const { showErrorMessage } = useNotifications()
    showErrorMessage()
    expect(ElNotification).toBeCalledWith({ title: 'Error', message: 'general.genericError', type: 'error' })
  })

  it('should call notification function if something is wrong', () => {
    const { showSuccessMessage } = useNotifications()
    showSuccessMessage()
    expect(ElNotification).toBeCalledWith({ title: 'Success', message: 'general.submitted', type: 'success' })
  })

  it('should call notification function if receive message', () => {
    const { showSuccessMessage } = useNotifications()
    showSuccessMessage('messageReceived')
    expect(ElNotification).toBeCalledWith({ title: 'Success', message: 'messageReceived', type: 'success' })
  })

  it('should call notification function if receive message', () => {
    const { showErrorMessage } = useNotifications()
    showErrorMessage('messageReceived')
    expect(ElNotification).toBeCalledWith({ title: 'Error', message: 'messageReceived', type: 'error' })
  })

  it('should call notification function if receive array of messages', () => {
    const { showErrorMessage } = useNotifications()
    const messages = ['hey', 'bye']

    showErrorMessage(messages)
    vi.advanceTimersByTime(100 * (messages.length - 1) + 2)
    expect(ElNotification).toBeCalledTimes(messages.length)
  })
})
