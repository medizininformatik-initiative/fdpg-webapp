import FdpgCommentForm from '../FdpgCommentForm.vue'
import { CommentType } from '@/types/comment.interface'
import { createTestingPinia } from '@pinia/testing'
import { mount, type VueWrapper } from '@vue/test-utils'
vi.mock('@/plugins/i18n', () => ({
  i18n: {
    global: {
      t: vi.fn().mockReturnValue('Test'),
    },
  },
}))

vi.mock('vue-i18n', () => ({
  useI18n: vi.fn().mockImplementation(() => ({
    t: vi.fn().mockImplementation((title, { checkedCount, optionsCount }) => {
      return title + checkedCount + optionsCount
    }),
    locale: {
      value: 'de-DE',
    },
  })),
}))

describe('FdpgCommentForm.vue', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    wrapper = mount(FdpgCommentForm, {
      props: {
        modelValue: 'commentValue',
        edit: false,
        type: CommentType.PROPOSAL_MESSAGE_TO_LOCATION,
        isDisabled: false,
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

  describe('if the is done is %s', () => {
    beforeEach(() => {})

    it('should emit save function', async () => {
      await wrapper.find('.edit-button').trigger('click')
      expect(wrapper.emitted().save).toBeTruthy()
    })

    it('should emit save function', async () => {
      await wrapper.find('.cancel-button').trigger('click')
      expect(wrapper.emitted().close).toBeTruthy()
    })
  })
})
