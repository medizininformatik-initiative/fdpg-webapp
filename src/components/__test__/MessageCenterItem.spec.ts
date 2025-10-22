import { useAuthStore } from '@/stores/auth/auth.store'
import MessageCenterItem from '../MessageCenterItem.vue'
import { createTestingPinia } from '@pinia/testing'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { CommentType, type IAnswerDetail } from '@/types/comment.interface'
import { Role } from '@/types/oidc.types'
import type { MockedObject } from 'vitest'
import { ElButton } from 'element-plus'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useMockLocationStore } from '@/stores/locations/__mocks__/location.store'

vi.mock('vue-i18n', () => ({
  useI18n: vi.fn().mockImplementation(() => ({
    t: vi.fn().mockImplementation((entry: string) => entry),
    locale: {
      value: 'de-DE',
    },
  })),
}))

vi.mock('@/stores/locations/location.store', () => ({
  useLocationStore: vi.fn().mockImplementation(() => useMockLocationStore),
}))

describe('MessageCenterItem.vue', () => {
  let authStore: MockedObject<ReturnType<typeof useAuthStore>>

  let wrapper: VueWrapper
  beforeEach(() => {
    wrapper = mount(MessageCenterItem, {
      props: {
        message: {
          owner: { role: Role.DizMember },
          locations: ['Charité', 'UKAU'],
        } as IAnswerDetail,
        type: CommentType.PROPOSAL_MESSAGE_TO_OWNER,
      },
      global: {
        plugins: [createTestingPinia()],
        stubs: [],
      },
    })
  })

  beforeEach(() => {
    authStore = vi.mocked(useAuthStore())
    authStore.singleKnownRole = Role.FdpgMember
    authStore.hasFdpgLevelPermissions = vi.fn().mockReturnValue(true)
  })

  it('renders', () => {
    expect(wrapper).toBeTruthy()
  })

  it('should emit toggleAnswerMode', async () => {
    const allButtons = wrapper.findAllComponents(ElButton)
    await allButtons[0].trigger('click')
    expect(wrapper.emitted('toggleAnswerMode')).toBeTruthy()
  })

  it('should emit markAsDone', async () => {
    const allButtons = wrapper.findAllComponents(ElButton)
    await allButtons[1].trigger('click')
    expect(wrapper.emitted('markAsDone')).toBeTruthy()
  })

  it('should change the text of owner', async () => {
    expect(wrapper.find('.message-owner').text()).toContain(`roles.${Role.DizMember}`)

    wrapper.setProps({
      message: {
        owner: { role: Role.DizMember, miiLocation: 'Charité' },
        locations: ['Charité', 'UKAU'],
      },
    })
    await flushPromises()
    expect(wrapper.find('.message-owner').text()).toContain(`${Role.DizMember}, ${'Charité'}`)
  })
})
