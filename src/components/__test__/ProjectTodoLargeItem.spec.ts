import ProjectTodoLargeItem from '../ProjectTodoLargeItem.vue'
import { createTestingPinia } from '@pinia/testing'
import { mount, type VueWrapper } from '@vue/test-utils'
import type { IProjectTodo } from '@/types/project-todo.interface'

describe('ProjectTodoLargeItem.vue', () => {
  let wrapper: VueWrapper
  beforeEach(() => {
    wrapper = mount(ProjectTodoLargeItem, {
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
})
