import { createTestingPinia } from '@pinia/testing'
import { mount, shallowMount, type VueWrapper } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ShoppingList from '../ShoppingList.vue'
import { useLayoutStore } from '@/stores/layout.store'
import { CreatPrposalSteps } from '@/types/create-proposal-steps.enum'
import type { MockedObject } from 'vitest'
import type { IDataSource } from '@/types/proposal.types'
import { mockDataSources } from '@/mocks/data-sources'
import { ElButton } from 'element-plus'

vi.mock('vue-i18n', () => ({
  useI18n: vi.fn().mockImplementation(() => ({
    t: vi.fn().mockImplementation((key: string) => key),
  })),
}))

describe('ShoppingList.vue', () => {
  let wrapper: VueWrapper<any>
  let layoutStore: MockedObject<ReturnType<typeof useLayoutStore>>

  const mountComponent = (props = {}, isOpen = true) => {
    return mount(ShoppingList, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              layout: {
                isShoppingListOpen: isOpen,
              },
            },
          }),
        ],
        stubs: {
          'el-button': true,
          'el-collapse': true,
          'el-collapse-item': true,
          FdpgLabel: true,
        },
      },
      props: {
        modelValue: [],
        ...props,
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    wrapper = mountComponent()
    layoutStore = vi.mocked(useLayoutStore())
  })

  it('renders correctly when open', () => {
    expect(wrapper.classes()).toContain('data-source-list-drawer-container')
    expect(wrapper.find('.data-source-list-drawer').exists()).toBe(true)
    expect(wrapper.find('.data-source-list-drawer').classes()).toContain('is-open')
  })

  it('renders correctly when closed', () => {
    wrapper = mountComponent({}, false)
    expect(wrapper.find('.data-source-list-drawer').classes()).not.toContain('is-open')
    expect(wrapper.find('.data-source-list-drawer-mask').exists()).toBe(false)
  })

  it('shows empty state when no sources are selected', () => {
    expect(wrapper.find('.empty-state').exists()).toBe(true)
    expect(wrapper.find('.empty-state').text()).toBe('proposal.noDataSourcesSelected')
  })

  it('displays data sources when provided', () => {
    wrapper = mountComponent({ modelValue: mockDataSources })

    // Check that collapse component exists (stub)
    expect(wrapper.find('el-collapse-stub').exists()).toBe(true)

    // Empty state should not be visible
    expect(wrapper.find('.empty-state').exists()).toBe(false)
  })

  it('closes the drawer when clicking on the mask', async () => {
    const mask = wrapper.find('.data-source-list-drawer-mask')
    await mask.trigger('click')

    expect(layoutStore.toggleShoppingList).toHaveBeenCalled()
  })

  it('closes the drawer when clicking on the close button', async () => {
    const closeButton = wrapper.find('el-button-stub[aria-label="Close"]')
    await closeButton.trigger('click')

    expect(layoutStore.toggleShoppingList).toHaveBeenCalled()
  })

  it('navigates to variables step when "Go to select variable" is clicked', async () => {
    await wrapper.vm.goToStep(CreatPrposalSteps.Variables)

    expect(layoutStore.goToStep).toHaveBeenCalledWith(CreatPrposalSteps.Variables)
    expect(layoutStore.toggleShoppingList).toHaveBeenCalled()
  })

  it('navigates to next step when "Next Step" button is clicked', async () => {
    await wrapper.vm.nextStep()

    expect(layoutStore.nextStep).toHaveBeenCalled()
    expect(layoutStore.toggleShoppingList).toHaveBeenCalled()
  })

  it('navigates to data sources step when "Continue with data source" is clicked', async () => {
    await wrapper.vm.goToStep(CreatPrposalSteps.DataSources)

    expect(layoutStore.goToStep).toHaveBeenCalledWith(CreatPrposalSteps.DataSources)
    expect(layoutStore.toggleShoppingList).toHaveBeenCalled()
  })

  it('closes the drawer on mount if it was open', () => {
    expect(layoutStore.toggleShoppingList).toHaveBeenCalled()
  })
})
