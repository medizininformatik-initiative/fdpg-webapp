import OldTask from './OldTask.vue'
import type { VueWrapper } from '@vue/test-utils';
import { shallowMount } from '@vue/test-utils'
import { mockCommentDetailForTask } from '@/mocks/comment.mock'
vi.mock('vue-i18n', () => ({
  useI18n: vi.fn().mockImplementation(() => ({
    t: vi.fn().mockReturnValue('Test'),
    locale: {
      value: 'de-DE',
    },
  })),
}))

describe('OldTask.vue', () => {
  let wrapper: VueWrapper<any>

  beforeEach(() => {
    wrapper = shallowMount(OldTask, {
      props: {
        task: mockCommentDetailForTask,
      },
      global: {
        stubs: ['i18n-t'],
      },
    })
  })

  it('renders', () => {
    expect(wrapper).toBeTruthy()
  })

  it('it applies the comment id to the task', () => {
    const taskWrapper = wrapper.get(`#${mockCommentDetailForTask._id}`)
    expect(taskWrapper).toBeTruthy()
  })

  it('toggles the content visibility', async () => {
    const toggle = wrapper.find('[data-testId="old-task__toggle_expand"]')
    const taskWrapper = wrapper.get('.task__content')
    expect(taskWrapper.classes()).not.toContain('task__content--expanded')
    await toggle.trigger('click')
    expect(taskWrapper.classes()).toContain('task__content--expanded')
  })
})
