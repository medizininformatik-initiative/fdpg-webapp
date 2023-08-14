import FdpgCheckList from '../FdpgCheckList.vue'
import { createTestingPinia } from '@pinia/testing'
import { mount } from '@vue/test-utils'

describe('FdpgCheckList.vue', () => {
  let wrapper: any
  beforeEach(() => {
    wrapper = mount(FdpgCheckList, {
      props: {
        modelValue: {},
        checklistOptions: {},
        isDisabled: false,
        title: 'title',
      },
      global: {
        plugins: [createTestingPinia()],
        stubs: ['el-checkbox-group'],
      },
    })
  })
  it('renders', () => {
    expect(wrapper).toBeTruthy()
  })

  it('should have h2 element filled by t func values', async () => {
    expect(wrapper.find('.section-title').text()).toContain('title{"checkedCount":0,"optionsCount"')
  })

  it('should be disabled', async () => {
    expect(wrapper.find('.checklist').attributes().disabled).toBe('false')
    await wrapper.setProps({ isDisabled: true, modelValue: {} })
    expect(wrapper.find('.checklist').attributes().disabled).toBe('true')
  })
})
