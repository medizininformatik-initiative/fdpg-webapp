import FdpgDashboardActions from '../FdpgDashboardActions.vue'
import { createTestingPinia } from '@pinia/testing'
import { mount } from '@vue/test-utils'

describe('FdpgDashboardActions.vue', () => {
  let wrapper: any
  beforeEach(() => {
    wrapper = mount(FdpgDashboardActions, {
      props: {
        placeholder: 'placeholder',
        minDate: new Date(2015, 1, 1),
      },
      global: {
        plugins: [createTestingPinia()],
        stubs: ['el-date-picker'],
      },
    })
  })

  it('renders', () => {
    expect(wrapper).toBeTruthy()
  })
})
