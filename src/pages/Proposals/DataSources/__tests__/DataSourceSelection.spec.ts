import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import DataSourceSelection from '@/pages/Proposals/DataSources/DataSourceSelection.vue'
import { useConfigStore } from '@/stores/config/config.store'
import { mockDataSources } from '@/mocks/data-sources'
import { PlatformIdentifier } from '@/types/platform-identifier.enum'

vi.mock('@/components/FdpgLabel.vue', () => ({
  default: {
    name: 'FdpgLabel',
    template: '<label><slot /></label>',
  },
}))

vi.mock('./DataSourceItem.vue', () => ({
  default: {
    name: 'DataSourceItem',
    props: ['dataSource', 'isSelected', 'platformIdentifier'],
    emits: ['change'],
    template:
      '<div class="data-source-item" @click="$emit(\'change\', platformIdentifier)">{{ dataSource.title }}</div>',
  },
}))

vi.mock('@/stores/config/config.store', () => ({
  useConfigStore: vi.fn(),
}))

describe('DataSourceSelection', () => {
  const getDataSourcesMock = vi.fn().mockResolvedValue(mockDataSources)

  beforeEach(() => {
    // Reset and setup store mock
    ;(useConfigStore as any).mockReturnValue({
      getDataSources: getDataSourcesMock,
      dataSources: mockDataSources,
    })
  })

  it('renders label and fetches data sources on mount', async () => {
    const wrapper = mount(DataSourceSelection, {
      props: {
        modelValue: [],
      },
    })

    // Wait for lifecycle and async call
    await wrapper.vm.$nextTick()
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(getDataSourcesMock).toHaveBeenCalled()
    const items = wrapper.findAllComponents({ name: 'DataSourceItem' })
    expect(items).toHaveLength(2)
  })

  it('emits update:modelValue when a new item is selected', async () => {
    const wrapper = mount(DataSourceSelection, {
      props: {
        modelValue: [],
      },
    })

    // Wait for lifecycle
    await new Promise((resolve) => setTimeout(resolve, 0))

    const item = wrapper.findAllComponents({ name: 'DataSourceItem' })[0]
    // Instead of triggering click, emit the change event directly
    await item.vm.$emit('change', PlatformIdentifier.DIFE)

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    const emittedValue = wrapper.emitted('update:modelValue')![0][0]
    expect(emittedValue).toEqual([PlatformIdentifier.DIFE])
  })
})
