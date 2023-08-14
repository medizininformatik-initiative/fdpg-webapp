import { mockProposal } from '@/mocks/proposal.mock'
import type { IProjectDetails } from '@/types/proposal.types'
import { createTestingPinia } from '@pinia/testing'
import { mount } from '@vue/test-utils'
import ProjectDetails from '../ProjectDetails.vue'
import { Department } from '@/types/department.enum'

vi.mock('vue-i18n', () => ({
  useI18n: vi.fn().mockImplementation(() => ({
    t: vi.fn().mockImplementation((key: string) => key),
  })),
}))

const mountComponent = () => {
  const modelValue: IProjectDetails = JSON.parse(JSON.stringify(mockProposal.userProject.projectDetails))
  return mount(ProjectDetails, {
    global: {
      plugins: [createTestingPinia()],
      stubs: [],
    },
    props: {
      reviewMode: false,
      modelValue,
    },
  })
}

describe('ProjectDetails.vue', () => {
  let wrapper: ReturnType<typeof mountComponent>

  beforeEach(() => {
    wrapper = mountComponent()
  })

  it('renders', () => {
    expect(wrapper).toBeTruthy()
  })

  it('should provide the correct departments to the select component', () => {
    const selectComponent = wrapper.findComponent({ name: 'FdpgSelect' })
    const selectComponentProps = selectComponent.props('options')
    const expected = Object.values(Department).map((value) => ({ label: `departments.${value}`, value }))
    expect(selectComponentProps).toEqual(expected)
  })
})
