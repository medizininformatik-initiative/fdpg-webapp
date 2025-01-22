import { createTestingPinia } from '@pinia/testing'
import { mount } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import DeclineDialog from '../DeclineDialog.vue'
import FdpgTextEditor from '../FdpgTextEditor.vue'
import type { FindAllComponentsSelector } from '@vue/test-utils/dist/types'
import { ElButton } from 'element-plus'
import { beforeEach, describe, expect, it, vi } from 'vitest'


describe('DeclineDialog.vue', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    wrapper = mount(DeclineDialog, {
      global: {
        plugins: [createTestingPinia()],
        stubs: {
          FdpgTextEditor: {
            template: '<textarea />', // Replace with a simple stub
          },
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

  const findComponentByText = (text: string, component: FindAllComponentsSelector): VueWrapper<any> => {
    const buttons = wrapper.findAllComponents(component)
    return buttons.filter((button) => button.text() === text)[0]
  }

  it('renders', () => {
    expect(wrapper).toBeTruthy()
  })

  it('should call the closeDialog method', async () => {
    const fdpgInput = wrapper.findComponent(FdpgTextEditor)
    await fdpgInput.vm.$emit('update:modelValue', 'test')

    const confirmButton = findComponentByText('proposal.rejectRequest', ElButton)
    await confirmButton.trigger('click')

    expect(wrapper.emitted().confirm).toEqual([['test']])
  })

  it('should call the closeDialog method', async () => {
    const closeButton = findComponentByText('general.cancel', ElButton)
    await closeButton.trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.at(-1)).toEqual(false)
  })
})
