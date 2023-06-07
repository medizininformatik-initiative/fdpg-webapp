import { RouteName } from '@/types/route-name.enum'
import { useLayoutStore } from './layout.store'
import { createPinia, setActivePinia } from 'pinia'
import type { IBreadcrumb } from '@/types/breadcrumb.interface'

describe('Layout Store', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
  })

  it('renders', () => {
    const store = useLayoutStore()
    expect(store).toBeTruthy()
  })

  it('should set Sidebar Visibility', async () => {
    const store = useLayoutStore()
    store.isSidebarVisible = false
    await store.setSidebarVisiblity(true)
    expect(store.isSidebarVisible).toBe(true)
  })

  it('should set last dashboard', async () => {
    const store = useLayoutStore()
    store.lastDashboard = RouteName.Dashboard
    await store.setLastDashboard(RouteName.NoPermission)
    expect(store.lastDashboard).toBe(RouteName.NoPermission)
  })

  it('should set breadcrumbs', async () => {
    const store = useLayoutStore()
    store.breadcrumbs = []
    await store.setBreadcrumbs([{ name: RouteName.NoPermission }] as IBreadcrumb[])
    expect(store.breadcrumbs).toEqual([{ name: RouteName.NoPermission }])
  })
})
