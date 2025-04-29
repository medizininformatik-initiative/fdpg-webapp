import { createTestingPinia } from '@pinia/testing'
import { mount, type VueWrapper } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ShoppingList from '../ShoppingList.vue'
import { useLayoutStore } from '@/stores/layout.store'
import { CreatPrposalSteps } from '@/types/create-proposal-steps.enum'
import type { MockedObject } from 'vitest'
import type { IDataSource } from '@/types/proposal.types'
import { mockDataSources } from '@/mocks/data-sources'
import { ElButton } from 'element-plus'
import { PlatformIdentifier } from '@/types/platform-identifier.enum'

vi.mock('vue-i18n', () => ({
  useI18n: vi.fn().mockImplementation(() => ({
    t: vi.fn().mockImplementation((key: string) => key),
  })),
}))

describe('ShoppingList.vue', () => {
  let wrapper: VueWrapper
  let layoutStore: MockedObject<ReturnType<typeof useLayoutStore>>

  beforeEach(() => {
    layoutStore = {
      isShoppingListOpen: true,
      toggleShoppingList: vi.fn(),
      goToStep: vi.fn(),
      nextStep: vi.fn(),
    } as any

    wrapper = mount(ShoppingList, {
      props: {
        modelValue: [PlatformIdentifier.DIFE],
      },
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              layout: layoutStore,
              config: {
                dataSources: mockDataSources,
              },
            },
          }),
        ],
        stubs: {
          'el-collapse': true,
          'el-collapse-item': true,
          'el-button': ElButton,
          FdpgLabel: true,
        },
      },
    })
  })

  it('displays data sources when provided', () => {
    expect(wrapper.find('el-collapse-stub').exists()).toBe(true)
    expect(wrapper.find('.empty-state').exists()).toBe(false)
  })
})
