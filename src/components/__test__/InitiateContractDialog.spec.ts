import InitiateContractDialog from '../InitiateContractDialog.vue'
import { createTestingPinia } from '@pinia/testing'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { ElButton, ElIcon, type UploadFile } from 'element-plus'
import FdpgUpload from '../FdpgUpload.vue'
import type { FindAllComponentsSelector } from '@vue/test-utils/dist/types'
import type { MiiLocation } from '@/types/location.enum'
vi.mock('vue-i18n', () => ({
  useI18n: vi.fn().mockImplementation(() => ({
    t: vi.fn().mockReturnValue('Test'),
    locale: {
      value: 'de-DE',
    },
  })),
}))

vi.mock('vue-router', () => ({
  createRouter: vi.fn().mockImplementation(() => ({ beforeEach: vi.fn() })),
  createWebHistory: vi.fn(),
  useRoute: vi.fn().mockReturnValue({ params: { id: 'proposalId' } }),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}))

describe('InitiateContractDialog.vue', () => {
  let wrapper: VueWrapper
  beforeEach(() => {
    wrapper = mount(InitiateContractDialog, {
      props: {
        modelValue: true,
        locations: ['MRI', 'KC'] as MiiLocation[],
      },
      global: {
        plugins: [createTestingPinia()],
        stubs: [],
      },
    })
  })

  const findComponentByTestId = (testId: string, component: FindAllComponentsSelector): VueWrapper<any> => {
    const buttons = wrapper.findAllComponents(component)
    return buttons.filter((el) => el.attributes('data-testid') === testId)[0]
  }

  it('renders', () => {
    expect(wrapper).toBeTruthy()
  })

  it('should handle initiateContract', async () => {
    const fdpgUploadComponent = wrapper.findComponent(FdpgUpload)
    await fdpgUploadComponent.vm.$emit('change', {} as UploadFile)
    const buttonComponent = findComponentByTestId('button__initiateContract', ElButton)
    await buttonComponent.trigger('click')
    expect(wrapper.emitted().initiateContract).toBeTruthy()
  })

  it('should emit close dialog', async () => {
    const buttonComponent = findComponentByTestId('button__closeInitiateContractDialog', ElButton)
    await buttonComponent.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
  })

  it('should handle remove file', async () => {
    const fdpgUploadComponent = wrapper.findComponent(FdpgUpload)
    fdpgUploadComponent.vm.$emit('change', {} as UploadFile)
    await flushPromises()
    await findComponentByTestId('icon__removeInitiateContractFile', ElIcon).trigger('click')
    const buttonComponent = findComponentByTestId('button__initiateContract', ElButton)
    await buttonComponent.trigger('click')
    expect(wrapper.emitted().initiateContract).toBeFalsy()
  })
})
