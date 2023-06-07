import { config } from '@vue/test-utils'

config.global.mocks = {
  $t: () => {},
}

window.open = vi.fn()

Object.defineProperty(URL, 'revokeObjectURL', {
  value: () => {},
})
