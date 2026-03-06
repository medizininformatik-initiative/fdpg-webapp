import FdpgDatePicker from '../FdpgDatePicker.vue'
import { createTestingPinia } from '@pinia/testing'
import { mount } from '@vue/test-utils'
import { CommentType } from '@/types/comment.interface'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('vue-i18n', () => ({
  useI18n: vi.fn().mockImplementation(() => ({
    t: vi.fn().mockReturnValue('Test'),
    locale: {
      value: 'de-DE',
    },
  })),
}))

describe('FdpgDatePicker.vue', () => {
  let wrapper: any
  beforeEach(() => {
    wrapper = mount(FdpgDatePicker, {
      props: {
        modelValue: 'string',
        isDisabled: false,
        type: CommentType.PROPOSAL_MESSAGE_TO_LOCATION,
        edit: true,
      },
      global: {
        plugins: [createTestingPinia()],
        stubs: ['el-button'],
      },
    })
  })
  it('renders', () => {
    expect(wrapper).toBeTruthy()
  })
})
