import { useAuthStore } from '@/stores/auth/auth.store'
import MessageCenterAnswerCreator from '../MessageCenterAnswerCreator.vue'
import { createTestingPinia } from '@pinia/testing'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { CommentType, type ICommentDetail } from '@/types/comment.interface'
import { Role } from '@/types/oidc.types'
import { ElButton } from 'element-plus'
import FdpgInput from '@/components/FdpgInput.vue'
import { MiiLocation } from '@/types/location.enum'
import LocationSelect from '../LocationSelect.vue'
import type { IVisibilityMessage } from '@/composables/use-location-visibility'
import type { MockedObject } from 'vitest'

vi.mock('vue-i18n', () => ({
  useI18n: vi.fn().mockImplementation(() => ({
    t: vi.fn().mockReturnValue('Test'),
    locale: {
      value: 'de-DE',
    },
  })),
}))

vi.mock('@/plugins/i18n', () => ({
  i18n: {
    global: {
      t: vi.fn().mockReturnValue('Test'),
    },
  },
}))
describe('MessageCenterAnswerCreator.vue', () => {
  let authStore: MockedObject<ReturnType<typeof useAuthStore>>
  let wrapper: VueWrapper & { vm: { visibilityMessage: IVisibilityMessage } }
  beforeEach(() => {
    createTestingPinia()
    authStore = vi.mocked(useAuthStore())
    authStore.singleKnownRole = Role.FdpgMember
    wrapper = mount(MessageCenterAnswerCreator, {
      props: {
        message: {
          owner: { role: Role.DizMember, miiLocation: MiiLocation.Charité },
          locations: [MiiLocation.Charité],
        } as ICommentDetail,
        type: CommentType.PROPOSAL_MESSAGE_TO_OWNER,
      },
      global: {
        plugins: [],
        stubs: [],
      },
    }) as any
  })

  it('renders', () => {
    expect(wrapper).toBeTruthy()
  })

  it('should emit createAnswer', async () => {
    const allButtons = wrapper.findAllComponents(ElButton)
    await wrapper.findComponent(FdpgInput).vm.$emit('update:modelValue', 'comment comment comment ')
    await allButtons[0].trigger('click')
    expect(wrapper.emitted('createAnswer')).toBeTruthy()
  })
  it('should emit toggleAnswerMode', async () => {
    const allButtons = wrapper.findAllComponents(ElButton)
    await allButtons[1].trigger('click')
    expect(wrapper.emitted('toggleAnswerMode')).toBeTruthy()
  })

  it('should update computed values', async () => {
    wrapper.findComponent(LocationSelect).vm.$emit('update:modelValue', [MiiLocation.Charité])
    await flushPromises()
    expect(wrapper.findComponent(LocationSelect).vm.modelValue).toEqual([MiiLocation.Charité])
    expect(wrapper.vm.visibilityMessage.locations).toEqual([MiiLocation.Charité])
  })

  it('should change minimum selection to empty array', async () => {
    wrapper.setProps({
      message: {
        owner: { role: Role.DizMember, miiLocation: [] },
        locations: [MiiLocation.Charité],
      } as unknown as ICommentDetail,
      type: CommentType.PROPOSAL_MESSAGE_TO_OWNER,
    })
    await flushPromises()
    expect(wrapper.findComponent(LocationSelect).vm.minimumSelection[0]).toEqual([])
  })
})
