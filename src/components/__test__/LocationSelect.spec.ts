import { useProposalStore } from '@/stores/proposal/proposal.store'
import LocationSelect from '../LocationSelect.vue'
import { createTestingPinia } from '@pinia/testing'
import { mount, type VueWrapper } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi, type MockedObject } from 'vitest'
import { mockProposal } from '@/mocks/proposal.mock'
import { ElCheckbox, ElSelect } from 'element-plus'
import { mockLocations, useMockLocationStore } from '@/stores/locations/__mocks__/location.store'

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

  describe('checkAll and indeterminate state', () => {
    it('should set indeterminate to true when some but not all locations are selected on mount', () => {
      // mounted with ['KC', 'KUM', 'MHH'] which is a subset of all locations
      expect(wrapper.vm.indeterminate).toBe(true)
      expect(wrapper.vm.checkAll).toBe(false)
    })

    it('should set checkAll to true and indeterminate to false when all locations are selected on mount', () => {
      const allIds = mockLocations.map((loc) => loc._id)
      const allSelectedWrapper = mount(LocationSelect, {
        props: {
          modelValue: allIds,
          placeholder: 'placeholder',
          minimumSelection: ['KC'],
          allLocations: [...mockLocations],
        },
        global: {
          plugins: [createTestingPinia()],
          stubs: ['el-progress'],
        },
      })

      expect(allSelectedWrapper.vm.checkAll).toBe(true)
      expect(allSelectedWrapper.vm.indeterminate).toBe(false)
    })

    it('should set checkAll and indeterminate to false when no locations are selected on mount', () => {
      const emptyWrapper = mount(LocationSelect, {
        props: {
          modelValue: [],
          placeholder: 'placeholder',
          minimumSelection: [],
          allLocations: [...mockLocations],
        },
        global: {
          plugins: [createTestingPinia()],
          stubs: ['el-progress'],
        },
      })

      expect(emptyWrapper.vm.checkAll).toBe(false)
      expect(emptyWrapper.vm.indeterminate).toBe(false)
    })

    it('should update indeterminate when modelValue changes from partial to all', async () => {
      expect(wrapper.vm.indeterminate).toBe(true)

      const allIds = mockLocations.map((loc) => loc._id)
      await wrapper.setProps({ modelValue: allIds })

      expect(wrapper.vm.checkAll).toBe(true)
      expect(wrapper.vm.indeterminate).toBe(false)
    })

    it('should update indeterminate when modelValue changes from all to partial', async () => {
      const allIds = mockLocations.map((loc) => loc._id)
      await wrapper.setProps({ modelValue: allIds })
      expect(wrapper.vm.checkAll).toBe(true)
      expect(wrapper.vm.indeterminate).toBe(false)

      await wrapper.setProps({ modelValue: ['KC'] })
      expect(wrapper.vm.checkAll).toBe(false)
      expect(wrapper.vm.indeterminate).toBe(true)
    })

    it('should select all locations when checkAll checkbox is toggled on', async () => {
      const checkbox = wrapper.findComponent(ElCheckbox)
      checkbox.vm.$emit('change', true)

      const allIds = mockLocations.map((loc) => loc._id)
      expect(wrapper.emitted('update:modelValue')?.at(-1)?.at(-1)).toEqual(allIds)
    })

    it('should deselect all locations when checkAll checkbox is toggled off', async () => {
      const checkbox = wrapper.findComponent(ElCheckbox)
      checkbox.vm.$emit('change', false)

      expect(wrapper.emitted('update:modelValue')?.at(-1)?.at(-1)).toEqual([])
    })
  })
})
