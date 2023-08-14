import { useAuthStore } from '@/stores/auth/auth.store'
import MessageCenter from '../MessageCenter.vue'
import { createTestingPinia } from '@pinia/testing'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import type { MockedObject } from 'vitest'
import { Role } from '@/types/oidc.types'
import { CommentType } from '@/types/comment.interface'
import FdpgCommentForm from '../FdpgCommentForm.vue'
import { useCommentStore } from '@/stores/comment/comment.store'
import useNotifications from '@/composables/use-notifications'
import { MiiLocation } from '@/types/location.enum'
import { ElSwitch } from 'element-plus'
vi.mock('vue-i18n', () => ({
  useI18n: vi.fn().mockImplementation(() => ({
    t: vi.fn().mockReturnValue('Test'),
    locale: {
      value: 'de-DE',
    },
  })),
}))
vi.mock('@/composables/use-notifications', async () => {
  const showErrorMessage = vi.fn()
  const showSuccessMessage = vi.fn()
  return {
    __esModule: true,
    default: vi.fn().mockImplementation(() => {
      return {
        showErrorMessage,
        showSuccessMessage,
      }
    }),
  }
})

vi.mock('vue-router', () => ({
  useRoute: vi.fn().mockReturnValue({ params: { id: 'proposalId' } }),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}))
vi.mock('@/plugins/i18n', () => ({
  i18n: {
    global: {
      t: vi.fn().mockReturnValue('Test'),
    },
  },
}))

describe('MessageCenter.vue', () => {
  let authStore: MockedObject<ReturnType<typeof useAuthStore>>
  let commentStore: MockedObject<ReturnType<typeof useCommentStore>>

  let wrapper: VueWrapper

  const mockedUseNotifications = vi.mocked(useNotifications())

  beforeEach(() => {
    wrapper = mount(MessageCenter, {
      props: {
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
    commentStore = vi.mocked(useCommentStore())
    commentStore.comments = [
      {
        createdAt: 'string',
        updatedAt: 'string',
        _id: 'string',
        isDone: true,
        owner: { miiLocation: MiiLocation.Charité, role: Role.Admin },
        locations: [MiiLocation.Charité],
        referenceObjectId: 'string',
        content: 'string',
        type: CommentType.PROPOSAL_MESSAGE_TO_LOCATION,
        versionOfItem: { mayor: 3, minor: 2 },
        answers: [
          {
            content: 'string',
            versionOfItem: { mayor: 3, minor: 2 },
            createdAt: 'string',
            updatedAt: 'string',
            _id: 'string',
            owner: { miiLocation: MiiLocation.Charité, role: Role.Admin },
            locations: [MiiLocation.Charité],
            isDone: true,
          },
        ],
      },
    ]
  })

  it('renders', () => {
    expect(wrapper).toBeTruthy()
  })

  it('should render title', async () => {
    expect(wrapper.find('h2').text()).toBe('proposal.messagesToApplicants')
    await wrapper.setProps({ type: CommentType.PROPOSAL_MESSAGE_TO_LOCATION })
    expect(wrapper.find('h2').text()).toBe('proposal.messagesToLocations')
  })

  it('should emit cancel FdpgCommentForm', async () => {
    const fdpgComponentForm = wrapper.findComponent(FdpgCommentForm)
    await fdpgComponentForm.vm.$emit('close')
    expect(fdpgComponentForm.vm.$props.modelValue).toEqual('')
  })

  it('should switch to show done comments', async () => {
    wrapper.findAllComponents(ElSwitch)[0].trigger('click')
  })

  it('should emit submit FdpgCommentForm', async () => {
    const fdpgComponentForm = wrapper.findComponent(FdpgCommentForm)
    await fdpgComponentForm.vm.$emit('save')
    expect(commentStore.createComment).toHaveBeenCalledTimes(1)
  })

  it('should raise error emit submit FdpgCommentForm', async () => {
    const fdpgComponentForm = wrapper.findComponent(FdpgCommentForm)

    commentStore.createComment.mockRejectedValueOnce(new Error('should not be called'))
    await fdpgComponentForm.vm.$emit('save')
    await flushPromises()
    expect(mockedUseNotifications.showErrorMessage).toHaveBeenCalledTimes(1)
  })
})
