import { config } from '@vue/test-utils'

config.global.mocks = {
  $t: (key: string, obj?: any) => key + (obj ? JSON.stringify(obj) : ''),
}

window.open = vi.fn()

Object.defineProperty(URL, 'revokeObjectURL', {
  value: () => {},
})

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))
