import FdpgUpload from '../FdpgUpload.vue'
import { createTestingPinia } from '@pinia/testing'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import DocumentList from '../Proposals/Details/DocumentList.vue'
import { ElUpload, type UploadFile, type UploadFiles } from 'element-plus'

vi.mock('vue-i18n', () => ({
  useI18n: vi.fn().mockImplementation(() => ({
    t: vi.fn().mockReturnValue('Test'),
    locale: {
      value: 'de-DE',
    },
  })),
}))

describe('FdpgUpload.vue', () => {
  let wrapper: VueWrapper
  beforeEach(() => {
    wrapper = mount(FdpgUpload, {
      props: {
        isDisabled: false,
      },
      global: {
        plugins: [createTestingPinia()],
        stubs: { 'el-upload': ElUpload },
      },
    })
  })

  it('renders', () => {
    expect(wrapper).toBeTruthy()
  })

  it('should emit remove event', async () => {
    const documentListComponent = wrapper.findComponent(DocumentList)
    await documentListComponent.vm.$emit('remove', 'proposalId')
    expect(wrapper.emitted().remove).toBeTruthy()
  })

  it('should emit change event', async () => {
    const uploadComponent = wrapper.findComponent(ElUpload)
    await uploadComponent.vm.onChange({} as UploadFile, [{}] as UploadFiles)
    await flushPromises()
    expect(wrapper.emitted().change).toBeTruthy()
  })
})
