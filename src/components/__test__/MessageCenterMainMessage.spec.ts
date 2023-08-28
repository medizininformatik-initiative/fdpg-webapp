import MessageCenterMainMessage from '../MessageCenterMainMessage.vue'
import { createTestingPinia } from '@pinia/testing'
import { mount, type VueWrapper } from '@vue/test-utils'
import { CommentType, type ICommentDetail } from '@/types/comment.interface'
import { Role } from '@/types/oidc.types'
import type { MockedObject } from 'vitest'
import { useCommentStore } from '@/stores/comment/comment.store'
import MessageCenterItem from '../MessageCenterItem.vue'
import { MiiLocation } from '@/types/location.enum'

vi.mock('vue-i18n', () => ({
  useI18n: vi.fn().mockImplementation(() => ({
    t: vi.fn().mockReturnValue('Test'),
    locale: {
      value: 'de-DE',
    },
  })),
}))

vi.mock('@/plugins/i18n', () => ({
  i18n: {
    global: {
      t: vi.fn().mockReturnValue('Test'),
    },
  },
}))
describe('MessageCenterMainMessage.vue', () => {
  let commentStore: MockedObject<ReturnType<typeof useCommentStore>>

  let wrapper: VueWrapper
  beforeEach(() => {
    wrapper = mount(MessageCenterMainMessage, {
      props: {
        showDoneComments: true,
        message: {
          owner: { role: Role.DizMember, miiLocation: MiiLocation.KC },
          answers: [
            {
              isDone: false,
              owner: { role: Role.DizMember, miiLocation: MiiLocation.KC },
            },
          ],
        } as ICommentDetail,
        type: CommentType.PROPOSAL_MESSAGE_TO_OWNER,
      },
      global: {
        plugins: [createTestingPinia()],
        stubs: [],
      },
    })
  })

  beforeEach(() => {
    commentStore = vi.mocked(useCommentStore())
  })

  it('renders', () => {
    expect(wrapper).toBeTruthy()
  })

  it('should call commentStore createAnswer', async () => {
    const messageCenterItemComponent = wrapper.findAllComponents(MessageCenterItem)[0]
    await messageCenterItemComponent.vm.$emit('createAnswer')
    expect(commentStore.createAnswer).toHaveBeenCalledTimes(1)
  })

  it('should call commentStore markAsDone', async () => {
    const messageCenterItemComponent = wrapper.findAllComponents(MessageCenterItem)[0]

    await messageCenterItemComponent.vm.$emit('markAsDone')
    expect(commentStore.markCommentAsDone).toHaveBeenCalledTimes(1)
  })

  it('should call commentStore markAsDone', async () => {
    const lastMessageCenterItemComponent = wrapper.findAllComponents(MessageCenterItem)[1]
    await lastMessageCenterItemComponent.vm.$emit('markAsDone')
    expect(commentStore.markAnswerAsDone).toHaveBeenCalledTimes(1)
  })

  it('should catch error from commentStore createAnswer', async () => {
    const messageCenterItemComponent = wrapper.findAllComponents(MessageCenterItem)[0]
    commentStore.createAnswer.mockRejectedValueOnce(new Error('should not be called'))
    await messageCenterItemComponent.vm.$emit('createAnswer')
    expect(commentStore.createAnswer).toHaveBeenCalledTimes(1)
  })

  it('should catch error from commentStore markAsDone', async () => {
    const messageCenterItemComponent = wrapper.findAllComponents(MessageCenterItem)[0]
    commentStore.markCommentAsDone.mockRejectedValueOnce(new Error('should not be called'))

    await messageCenterItemComponent.vm.$emit('markAsDone')
    expect(commentStore.markCommentAsDone).toHaveBeenCalledTimes(1)
  })

  it('should catch error from commentStore markAsDone', async () => {
    const lastMessageCenterItemComponent = wrapper.findAllComponents(MessageCenterItem)[1]
    commentStore.markAnswerAsDone.mockRejectedValueOnce(new Error('should not be called'))

    await lastMessageCenterItemComponent.vm.$emit('markAsDone')
    expect(commentStore.markAnswerAsDone).toHaveBeenCalledTimes(1)
  })
})
