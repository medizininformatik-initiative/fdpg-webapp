import ProjectTodoItem from '../ProjectTodoItem.vue'
import { createTestingPinia } from '@pinia/testing'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import type { IProjectTodo } from '@/types/project-todo.interface'

describe('ProjectTodoItem.vue', () => {
  let wrapper: VueWrapper
  beforeEach(() => {
    wrapper = mount(ProjectTodoItem, {
      props: { projectTodo: {} as IProjectTodo },
      global: {
        plugins: [createTestingPinia()],
        stubs: [],
      },
    })
  })

  it('renders', () => {
    expect(wrapper).toBeTruthy()
  })

  it('should expand', async () => {
    await wrapper.find('.todo-title').trigger('click')
    expect(wrapper.find('.todo-description--long')).toBeTruthy()
    expect(wrapper.find('.todo-action')).toBeTruthy()
    await wrapper.find('.icon-rotate').trigger('click')
  })

  it('should should render todo-action', async () => {
    await wrapper.setProps({ projectTodo: { actionLabel: 'general.noPermissionToViewPage' }, isDisabled: false })
    await wrapper.find('.todo-title').trigger('click')
    await flushPromises()
    expect(wrapper.find('.todo-action').attributes()).toBeTruthy()
  })
})
