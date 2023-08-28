import { createTestingPinia } from '@pinia/testing'
import { VueWrapper, mount } from '@vue/test-utils'
import DeclineDialog from '../DeclineDialog.vue'

describe('DeclineDialog.vue', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    wrapper = mount(DeclineDialog, {
      global: {
        plugins: [createTestingPinia()],
        stubs: {
          teleport: true,
        },
      },
      props: {
        modelValue: true,
        title: 'proposal.rejectContractProposal',
        description: 'proposal.rejectContractProposalModalDescriptionResearcher',
        buttonText: 'proposal.rejectRequest',
      },
    })
  })

  const getButtonByText = (text: string) => {
    const buttons = wrapper.findAll('button')
    return buttons.filter((button) => button.text() === text)[0]
  }

  it('renders', () => {
    expect(wrapper).toBeTruthy()
  })

  it('should call the closeDialog method', async () => {
    const fdpgInput = wrapper.findComponent({ name: 'FdpgInput' })
    await fdpgInput.vm.$emit('update:modelValue', 'test')

    const confirmButton = getButtonByText('proposal.rejectRequest')
    await confirmButton.trigger('click')

    expect(wrapper.emitted().confirm).toEqual([['test']])
  })

  it('should call the closeDialog method', async () => {
    const closeButton = getButtonByText('general.cancel')
    await closeButton.trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.at(-1)).toEqual(false)
  })
})
