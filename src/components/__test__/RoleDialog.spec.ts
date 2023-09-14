import { useAuthStore } from '@/stores/auth/auth.store'
import RoleDialog from '../RoleDialog.vue'
import FdpgDialog from '../FdpgDialog.vue'
import { createTestingPinia } from '@pinia/testing'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import type { MockedObject } from 'vitest'
vi.mock('vue-router', () => ({
  createRouter: vi.fn().mockImplementation(() => ({ beforeEach: vi.fn() })),
  createWebHistory: vi.fn(),
  useRoute: vi.fn().mockReturnValue({ params: { id: 'proposalId' } }),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}))
describe('RoleDialog.vue', () => {
  let authStore: MockedObject<ReturnType<typeof useAuthStore>>
  let wrapper: VueWrapper
  beforeEach(() => {
    wrapper = mount(RoleDialog, {
      global: {
        plugins: [createTestingPinia()],
        stubs: [],
      },
    })
  })

  beforeEach(() => {
    authStore = vi.mocked(useAuthStore())
  })

  it('renders', () => {
    expect(wrapper).toBeTruthy()
  })

  it('should check if closedialog has been called', async () => {
    const FdpgDialogComponent = wrapper.findComponent(FdpgDialog)
    await FdpgDialogComponent.vm.$emit('close')
    await flushPromises()
    expect(authStore.closeChangeRoleDialog).toHaveBeenCalledTimes(1)
  })
})
