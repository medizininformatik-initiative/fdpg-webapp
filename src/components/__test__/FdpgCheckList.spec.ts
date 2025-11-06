import FdpgCheckList from '../FdpgCheckList.vue'
import { createTestingPinia } from '@pinia/testing'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { ProposalStatus } from '@/types/proposal.types'
import { createI18n } from 'vue-i18n'
import type { ComponentPublicInstance } from 'vue'

declare module 'vue' {
  interface ComponentCustomProperties {
    $t: (key: string, values?: Record<string, any>) => string
  }
}

describe('FdpgCheckList.vue', () => {
  let wrapper: any
  let i18n: any

  beforeEach(() => {
    i18n = createI18n({
      legacy: false,
      locale: 'en',
      messages: {
        en: {
          proposal: {
            checklistTitle: 'title',
            isRegistrationLinkSentLabel: 'Registration Link Sent',
          },
        },
      },
    })

    wrapper = mount(FdpgCheckList, {
      props: {
        modelValue: {},
        checklist: {
          checkListVerification: [],
          projectProperties: [],
          isRegistrationLinkSent: false,
          initialViewing: false,
          depthCheck: false,
          ethicsCheck: false,
          fdpgInternalCheckNotes: '',
        },
        isDisabled: false,
        title: 'proposal.checklistTitle',
        status: ProposalStatus.FdpgCheck,
      },
      global: {
        plugins: [createTestingPinia(), i18n],
        stubs: ['el-checkbox-group'],
      },
    })
  })

  it('renders', () => {
    expect(wrapper).toBeTruthy()
  })

  it('should have h2 element filled by t func values', async () => {
    const title = wrapper.find('.section-title')
    expect(title.exists()).toBe(true)
    expect(title.text()).toBe('title')
  })

  it('should be always visible', async () => {
    const checklist = wrapper.find('.section__checklist')
    expect(checklist.exists()).toBe(true)
  })
})
