import FdpgSidebarItemUrl from '../FdpgSidebarItemUrl.vue'
import { createTestingPinia } from '@pinia/testing'
import { mount, type VueWrapper } from '@vue/test-utils'
import { MenuType } from '@/types/sidebar-menu.types'
import type { SidebarUrlMenu } from '@/types/sidebar-menu.types'

describe('FdpgSidebarItemUrl.vue', () => {
  let wrapper: VueWrapper
  beforeEach(() => {
    wrapper = mount(FdpgSidebarItemUrl, {
      props: {
        menu: {
          kind: MenuType.Url,
          title: 'NestedPath<MessageSchema>',
          url: 'string',
        } as unknown as SidebarUrlMenu,
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
