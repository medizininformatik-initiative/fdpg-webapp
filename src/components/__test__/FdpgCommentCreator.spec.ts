import FdpgCommentCreator from '../FdpgCommentCreator.vue'
import { CommentType } from '@/types/comment.interface'
import { useCommentStore } from '@/stores/comment/comment.store'
import type { MockedObject } from 'vitest'
import { MiiLocation } from '@/types/location.enum'
import { Role } from '@/types/oidc.types'
import { createTestingPinia } from '@pinia/testing'
import { mount, type VueWrapper } from '@vue/test-utils'
import FdpgCommentForm from '../FdpgCommentForm.vue'
vi.mock('@/plugins/i18n', () => ({
  i18n: {
    global: {
      t: vi.fn().mockReturnValue('Test'),
    },
  },
}))

vi.mock('vue-router', () => ({
  useRoute: vi.fn().mockReturnValue({ params: { id: 'proposalId' } }),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}))
vi.mock('vue-i18n', () => ({
  useI18n: vi.fn().mockImplementation(() => ({
    t: vi.fn().mockImplementation((title, { checkedCount, optionsCount }) => {
      return title + checkedCount + optionsCount
    }),
    locale: {
      value: 'de-DE',
    },
  })),
}))
describe('FdpgCommentCreator.vue', () => {
  let commentStore: MockedObject<ReturnType<typeof useCommentStore>>
  let wrapper: VueWrapper

  beforeEach(() => {
    wrapper = mount(FdpgCommentCreator, {
      props: {
        type: CommentType.PROPOSAL_MESSAGE_TO_LOCATION,
        objectId: 'string',
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

  describe.each([true, false])('if the is done is %s', (isDone: boolean) => {
    beforeEach(() => {
      commentStore.commentsObj = {
        string: [
          {
            createdAt: 'string',
            updatedAt: 'string',
            _id: 'mockedCommentId',
            isDone: isDone,
            owner: { role: Role.Researcher, miiLocation: MiiLocation.Charité },
            locations: [MiiLocation.Charité],
            referenceObjectId: 'string',
            content: 'contentMock',
            type: CommentType.PROPOSAL_MESSAGE_TO_LOCATION,
            versionOfItem: { mayor: 5, minor: 3 },
            answers: [],
          },
        ],
      }
    })

    it('should i has the is-done class when isDone is true', async () => {
      expect(wrapper.find('.is-done').exists()).toBe(isDone)
      expect(wrapper.find('.comment-card-body').text()).toBe('contentMock')
      expect(wrapper.find('.create-comment-button').exists()).toBe(true)
    })

    it('should open the comment field card when clicking create comment', async () => {
      await wrapper.find('.create-comment-button').trigger('click')
      expect(wrapper.find('.comment-field-card').exists()).toBe(true)
      expect(wrapper.find('.create-comment-button').exists()).toBe(false)
    })

    it('should create new comment', async () => {
      await wrapper.find('.create-comment-button').trigger('click')
      const commentForm = wrapper.findComponent(FdpgCommentForm)
      await commentForm.vm.$emit('save', 'model value')
      expect(commentStore.createComment).toHaveBeenCalledTimes(1)
    })

    it('should cancel adding comment', async () => {
      await wrapper.find('.create-comment-button').trigger('click')
      const commentForm = wrapper.findComponent(FdpgCommentForm)
      await commentForm.find('.cancel-button').trigger('click')
      expect(wrapper.find('.comment-field-card').exists()).toBe(false)
    })

    it('should update a comment', async () => {
      await wrapper.find('.edit-btn').trigger('click')
      expect(wrapper.find('.comment-field-card').exists()).toBe(true)
      expect(wrapper.findComponent(FdpgCommentForm).exists()).toBe(true)
      const commentForm = wrapper.findComponent(FdpgCommentForm)
      await commentForm.find('.edit-button').trigger('click')
      expect(commentStore.updateComment).toHaveBeenCalledTimes(1)
    })

    it('should delete a comment', async () => {
      await wrapper.find('.delete-btn').trigger('click')
      expect(commentStore.deleteComment).toHaveBeenCalledWith('mockedCommentId')
    })
  })
})
