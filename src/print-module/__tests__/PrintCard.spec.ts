import { shallowMount, type VueWrapper } from '@vue/test-utils'
import PrintCard from '../components/PrintCard.vue'

describe('PrintCard', () => {
  let wrapper: VueWrapper<any>

  beforeEach(() => {
    wrapper = shallowMount(PrintCard, {
      global: {
        plugins: [],
        stubs: [],
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
    expect(wrapper).toBeTruthy()
  })
})
