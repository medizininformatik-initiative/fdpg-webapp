import { mockCommentDetailForTask } from '@/mocks/comment.mock'
import { useCommentStore } from '@/stores/comment/comment.store'
import { createTestingPinia } from '@pinia/testing'
import type { VueWrapper } from '@vue/test-utils';
import { shallowMount } from '@vue/test-utils'
import CurrentTask from './CurrentTask.vue'

vi.mock('vue-i18n', () => ({
  useI18n: vi.fn().mockImplementation(() => ({
    t: vi.fn().mockReturnValue('Test'),
    locale: {
      value: 'de-DE',
    },
  })),
}))

describe('CurrentTask.vue', () => {
  let wrapper: VueWrapper<any>

  let commentStore: ReturnType<typeof useCommentStore>

  beforeEach(() => {
    wrapper = shallowMount(CurrentTask, {
      props: {
        task: mockCommentDetailForTask,
      },
      global: {
        plugins: [createTestingPinia()],
        stubs: ['i18n-t'],
      },
    })
  })

  beforeEach(() => {
    commentStore = vi.mocked(useCommentStore())
  })

  it('renders', () => {
    expect(wrapper).toBeTruthy()
  })

  it('it applies the comment id to the task', () => {
    const taskWrapper = wrapper.get(`#${mockCommentDetailForTask._id}`)
    expect(taskWrapper).toBeTruthy()
  })

  it('calls the api to set the comment as done', async () => {
    const toggle = wrapper.find('[data-testId="current-task__is-done-trigger"]')
    await toggle.trigger('click')
    expect(commentStore.markCommentAsDone).toHaveBeenCalledWith(mockCommentDetailForTask._id, true)
  })
})
