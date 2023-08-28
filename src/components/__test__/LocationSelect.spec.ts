import { useProposalStore } from '@/stores/proposal/proposal.store'
import LocationSelect from '../LocationSelect.vue'
import { createTestingPinia } from '@pinia/testing'
import { flushPromises, mount, shallowMount, type VueWrapper } from '@vue/test-utils'
import type { MockedObject } from 'vitest'
import { mockProposal } from '@/mocks/proposal.mock'
import { MiiLocation } from '@/types/location.enum'
import { ElSelect } from 'element-plus'

vi.mock('@/plugins/i18n', () => ({
  i18n: {
    global: {
      t: vi.fn().mockImplementation((entry) => entry),
    },
  },
}))

describe('LocationSelect.vue', () => {
  let proposalStore: MockedObject<ReturnType<typeof useProposalStore>>

  let wrapper: VueWrapper & { vm: { select: HTMLElement; modelValue: MiiLocation[] } }
  beforeEach(() => {
    wrapper = mount(LocationSelect, {
      props: {
        modelValue: [MiiLocation.KC, MiiLocation.KUM, MiiLocation.MHH],
        placeholder: 'placeholder',
        minimumSelection: [MiiLocation.KC],
      },
      global: {
        plugins: [createTestingPinia()],
        stubs: ['el-progress'],
      },
    }) as any
  })

  beforeEach(() => {
    proposalStore = vi.mocked(useProposalStore())
    proposalStore.currentProposal = mockProposal
  })

  it('renders', () => {
    expect(wrapper).toBeTruthy()
  })

  it('should disable pointer', async () => {
    expect(wrapper.find('.content').attributes().class).not.toContain('no-pointer')
    wrapper.findComponent(ElSelect).vm.$emit('visible-change', true)
    await flushPromises()
    expect(wrapper.find('.content').attributes().class).toContain('no-pointer')
  })

  it('should toggle', async () => {
    const dispatchEvent = vi.fn()
    wrapper.vm.select.querySelector = vi.fn().mockReturnValueOnce({ dispatchEvent })
    await wrapper.find('.content').trigger('click')
    expect(dispatchEvent.mock.calls[0][0]).toBeInstanceOf(KeyboardEvent)
  })

  it('should change selection computed', async () => {
    wrapper.findComponent(ElSelect).vm.$emit('update:modelValue', [MiiLocation.VirtualAll])
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.at(-1)).toEqual([MiiLocation.VirtualAll])

    wrapper.findComponent(ElSelect).vm.$emit('update:modelValue', [MiiLocation.KC])
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.at(-1)).toEqual([MiiLocation.KC])

    wrapper.findComponent(ElSelect).vm.$emit('update:modelValue', [])
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.at(-1)).toEqual([MiiLocation.KC])

    wrapper.setProps({ modelValue: [MiiLocation.VirtualAll, MiiLocation.Charité] })
    wrapper
      .findComponent(ElSelect)
      .vm.$emit('update:modelValue', [MiiLocation.KC, MiiLocation.VirtualAll, MiiLocation.Charité])
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.at(-1)).toEqual([MiiLocation.VirtualAll])
  })
})
