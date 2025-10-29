import { useProposalStore } from '@/stores/proposal/proposal.store'
import LocationSelect from '../LocationSelect.vue'
import { createTestingPinia } from '@pinia/testing'
import { mount, type VueWrapper } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi, type MockedObject } from 'vitest'
import { mockProposal } from '@/mocks/proposal.mock'
import { ElSelect } from 'element-plus'
import { mockLocations, useMockLocationStore } from '@/stores/locations/__mocks__/location.store'

vi.mock('vue-i18n', () => ({
  useI18n: vi.fn().mockImplementation(() => ({
    t: vi.fn().mockImplementation((key: string) => key), // Returns the key itself
  })),
}))

vi.mock('@/stores/locations/location.store', () => ({
  useLocationStore: vi.fn().mockImplementation(() => useMockLocationStore),
}))

describe('LocationSelect.vue', () => {
  let proposalStore: MockedObject<ReturnType<typeof useProposalStore>>

  let wrapper: VueWrapper & { vm: { select: HTMLElement; modelValue: string[] } }

  beforeEach(() => {
    wrapper = mount(LocationSelect, {
      props: {
        modelValue: ['KC', 'KUM', 'MHH'],
        placeholder: 'placeholder',
        minimumSelection: ['KC'],
        allLocations: [...mockLocations],
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

    component.vm.$emit('update:modelValue', ['KC'])
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.at(-1)).toEqual(['KC'])

    await component.vm.$emit('visible-change', true)
    component.vm.$emit('update:modelValue', [])
    await component.vm.$emit('visible-change', false)
    expect(wrapper.emitted('update:modelValue')?.flat(2).includes(['KC']))

    wrapper.setProps({ modelValue: ['Charité'] })
    wrapper.findComponent(ElSelect).vm.$emit('update:modelValue', ['KC', 'Charité'])
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.at(-1)).toEqual(['KC', 'Charité'])
  })
})
