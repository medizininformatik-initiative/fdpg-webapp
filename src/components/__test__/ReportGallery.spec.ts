import ReportGallery from '../ReportGallery.vue'
import { createTestingPinia } from '@pinia/testing'
import { mount, type VueWrapper } from '@vue/test-utils'
import type { IReportFile } from '@/types/proposal.types'

describe('ReportGallery.vue', () => {
  let wrapper: VueWrapper
  beforeEach(() => {
    wrapper = mount(ReportGallery, {
      props: {
        uploads: [
          { downloadUrl: 'string', mimetype: 'string', fileName: 'sdf', fileSize: 'asdf', createdAt: 'asdf' },
        ] as unknown as IReportFile,
      },
      global: {
        plugins: [createTestingPinia()],
        stubs: [],
      },
    })
  })

  it('renders', () => {
    expect(wrapper).toBeTruthy()
  })
})
