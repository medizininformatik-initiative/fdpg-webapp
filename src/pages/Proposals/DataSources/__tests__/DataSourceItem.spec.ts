import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import DataSourceItem from '@/pages/Proposals/DataSources/DataSourceItem.vue'
import { PlatformIdentifier } from '@/types/platform-identifier.enum'
import type { IDataSource } from '@/types/proposal.types'

vi.mock('@/components/FdpgLabel.vue', () => ({
  default: {
    name: 'FdpgLabel',
    template: '<div class="mock-fdpg-label"><slot></slot></div>',
    props: ['htmlFor', 'size'],
  },
}))

describe('DataSourceItem', () => {
  const mockDataSource: IDataSource = {
    _id: 'source1',
    tag: PlatformIdentifier.DIFE,
    title: 'proposal.dife_title',
    description: 'proposal.dife_description',
    externalLink: 'proposal.dife_link',
  }

  it('renders the component with data source information', () => {
    const wrapper = mount(DataSourceItem, {
      props: {
        dataSource: mockDataSource,
        isSelected: false,
      },
      global: {
        mocks: {
          $t: (key: string) => key, // Simple mock for the translation function
        },
      },
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.data-source-card').exists()).toBe(true)
    expect(wrapper.find('.identifier').text()).toBe(mockDataSource.tag)
    expect(wrapper.find('.mock-fdpg-label').exists()).toBe(true)
    expect(wrapper.find('p').text()).toBe(mockDataSource.description)
    expect(wrapper.find('.info-link').attributes('href')).toBe(mockDataSource.externalLink)
    expect(wrapper.find('.action-button').exists()).toBe(true)
  })

  it('applies selected class when isSelected is true', () => {
    const wrapper = mount(DataSourceItem, {
      props: {
        dataSource: mockDataSource,
        isSelected: true,
      },
      global: {
        mocks: {
          $t: (key: string) => key, // Simple mock for the translation function
        },
      },
    })

    expect(wrapper.classes()).toContain('is-selected')
  })

  it('emits change event when the action button is clicked', async () => {
    const wrapper = mount(DataSourceItem, {
      props: {
        dataSource: mockDataSource,
        isSelected: false,
      },
      global: {
        mocks: {
          $t: (key: string) => key, // Simple mock for the translation function
        },
      },
    })

    await wrapper.find('.action-button').trigger('click')

    expect(wrapper.emitted('change')).toBeTruthy()
    expect(wrapper.emitted('change')![0][0]).toEqual(mockDataSource)
  })
})
