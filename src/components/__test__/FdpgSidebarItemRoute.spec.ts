import FdpgSidebarItemRoute from '../FdpgSidebarItemRoute.vue'
import { createTestingPinia } from '@pinia/testing'
import { mount, type VueWrapper } from '@vue/test-utils'
import { MenuType } from '@/types/sidebar-menu.types'
import { RouteName } from '@/types/route-name.enum'

describe('FdpgSidebarItemRoute.vue', () => {
  let wrapper: VueWrapper
  beforeEach(() => {
    wrapper = mount(FdpgSidebarItemRoute, {
      props: {
        menu: {
          kind: MenuType.Route,
          to: RouteName.Archive,
          title: '' as any,
          icon: 'string',
        },
      },
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
