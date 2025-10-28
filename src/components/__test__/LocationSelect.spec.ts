import { useProposalStore } from '@/stores/proposal/proposal.store'
import LocationSelect from '../LocationSelect.vue'
import { createTestingPinia } from '@pinia/testing'
import { mount, type VueWrapper } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi, type MockedObject } from 'vitest'
import { mockProposal } from '@/mocks/proposal.mock'
import { MiiLocation } from '@/types/location.enum'
import { ElSelect } from 'element-plus'

vi.mock('vue-i18n', () => ({
  useI18n: vi.fn().mockImplementation(() => ({
    t: vi.fn().mockImplementation((key: string) => key),
    locale: {
      value: 'de-DE',
    },
  })),
}))

vi.mock('@/plugins/i18n', () => ({
  i18n: {
    global: {
      t: vi.fn().mockImplementation((entry) => entry),
    },
  },
  createI18n: vi.fn(),
  useI18n: vi.fn().mockImplementation(() => ({
    t: vi.fn().mockImplementation((key: string) => key),
  })),
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

  it('should change selection computed', async () => {
    const component = wrapper.findComponent(ElSelect)

    component.vm.$emit('update:modelValue', [MiiLocation.VirtualAll])
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.at(-1)).toEqual([MiiLocation.VirtualAll])

    component.vm.$emit('update:modelValue', [MiiLocation.KC])
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.at(-1)).toEqual([MiiLocation.KC])

    await component.vm.$emit('visible-change', true)
    component.vm.$emit('update:modelValue', [])
    await component.vm.$emit('visible-change', false)
    expect(wrapper.emitted('update:modelValue')?.flat(2).includes([MiiLocation.KC]))

    wrapper.setProps({ modelValue: [MiiLocation.VirtualAll, MiiLocation.Charité] })
    wrapper
      .findComponent(ElSelect)
      .vm.$emit('update:modelValue', [MiiLocation.KC, MiiLocation.VirtualAll, MiiLocation.Charité])
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.at(-1)).toEqual([MiiLocation.VirtualAll])
  })
})
