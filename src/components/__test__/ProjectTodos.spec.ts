import ProjectTodos from '../ProjectTodos.vue'
import { createTestingPinia } from '@pinia/testing'
import { mount, type VueWrapper } from '@vue/test-utils'
import type { IProjectTodo } from '@/types/project-todo.interface'

describe('ProjectTodos.vue', () => {
  let wrapper: VueWrapper
  beforeEach(() => {
    wrapper = mount(ProjectTodos, {
      props: { projectTodos: [{} as IProjectTodo] },
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
