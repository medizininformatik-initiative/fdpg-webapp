import { shallowMount, type VueWrapper } from '@vue/test-utils'
import PrintCard from '../components/PrintCard.vue'
import { createI18n } from 'vue-i18n'
import { createPinia } from 'pinia'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: { en: {} },
})

describe('PrintCard', () => {
  let wrapper: VueWrapper<any>

  beforeEach(() => {
    wrapper = shallowMount(PrintCard, {
      global: {
        plugins: [i18n, createPinia()],
        stubs: ['ReviewLabel', 'el-checkbox', 'el-loading', 'el-tooltip'],
      },
      props: {
        dto: {},
        card: {
          cardLabel: 'Test',
        } as any,
        headline: 'h2',
      },
    })
  })

  it('renders', () => {
    expect(wrapper.exists()).toBe(true)
  })
})
