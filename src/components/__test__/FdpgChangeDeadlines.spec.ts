import { DueDateEnum } from '@/types/due-date.enum'
import { ProposalStatus } from '@/types/proposal.types'

vi.mock('@/utils/deadlines', () => {
  return {
    beforeDeadlineDateConstrains: {
      [DueDateEnum.DUE_DAYS_LOCATION_CHECK]: DueDateEnum.DUE_DAYS_FDPG_CHECK,
      [DueDateEnum.DUE_DAYS_LOCATION_CONTRACTING]: DueDateEnum.DUE_DAYS_LOCATION_CHECK,
      [DueDateEnum.DUE_DAYS_EXPECT_DATA_DELIVERY]: DueDateEnum.DUE_DAYS_LOCATION_CONTRACTING,
      [DueDateEnum.DUE_DAYS_DATA_CORRUPT]: DueDateEnum.DUE_DAYS_EXPECT_DATA_DELIVERY,
      [DueDateEnum.DUE_DAYS_FINISHED_PROJECT]: DueDateEnum.DUE_DAYS_EXPECT_DATA_DELIVERY,
    },
    cleanDueDateKey: vi.fn((key) => key + ' (cleaned)'),
    defaultDeadlineOrderList: [
      { deadlineType: DueDateEnum.DUE_DAYS_FDPG_CHECK, order: 1 },
      { deadlineType: DueDateEnum.DUE_DAYS_LOCATION_CHECK, order: 2 },
    ],
    statusToDueDatesMap: {
      [ProposalStatus.FdpgCheck]: [
        DueDateEnum.DUE_DAYS_FDPG_CHECK,
        DueDateEnum.DUE_DAYS_DATA_CORRUPT,
        DueDateEnum.DUE_DAYS_FINISHED_PROJECT,
      ],
      [ProposalStatus.Draft]: [],
    },
  }
})

vi.mock('../FdpgDeadlineItem.vue', () => ({
  default: {
    name: 'FdpgDeadlineItem',
    template: '<div class="mock-deadline-item"></div>',
    props: ['modelValue', 'label', 'placeholder', 'disabled', 'minDate', 'maxDate'],
  },
}))

import { mount } from '@vue/test-utils'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import FdpgChangeDeadlines from '../FdpgChangeDeadlines.vue'

describe('FdpgChangeDeadlines.vue', () => {
  const mockDeadlines = {
    [DueDateEnum.DUE_DAYS_FDPG_CHECK]: '2024-03-20T08:00:00.000Z',
    [DueDateEnum.DUE_DAYS_LOCATION_CHECK]: '2024-03-25T08:00:00.000Z',
  }

  const $t = vi.fn((key) => key)

  let wrapper: any

  beforeEach(() => {
    wrapper = mount(FdpgChangeDeadlines, {
      props: {
        deadlines: mockDeadlines,
        status: ProposalStatus.Draft,
      },
      global: {
        mocks: { $t },
      },
      attachTo: document.body,
    })
  })

  it('renders the component with the correct title', async () => {
    expect(wrapper.find('.section-title').text()).toBe('proposal.deadlinesChange')

    await wrapper.setProps({ status: ProposalStatus.FdpgCheck })

    wrapper.vm.proposalDeadlines[DueDateEnum.DUE_DAYS_FDPG_CHECK] = '2024-03-21T08:00:00.000Z'
    await wrapper.vm.$nextTick()

    await wrapper.vm.saveDeadlines()
    await wrapper.vm.$nextTick()

    const events = wrapper.emitted('saveDeadlines')
    expect(events).toHaveLength(1)
  })

  it('emits saveDeadlines event when the save method is called', async () => {
    await wrapper.setProps({ status: ProposalStatus.FdpgCheck })

    wrapper.vm.proposalDeadlines[DueDateEnum.DUE_DAYS_FDPG_CHECK] = '2024-03-21T08:00:00.000Z'
    await wrapper.vm.$nextTick()

    await wrapper.vm.saveDeadlines()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('saveDeadlines')).toBeTruthy()

    const emittedEvents = wrapper.emitted('saveDeadlines')
    expect(emittedEvents).toHaveLength(1)

    const emittedData = emittedEvents![0][0]
    expect(emittedData).toHaveProperty(DueDateEnum.DUE_DAYS_FDPG_CHECK)
    expect(emittedData).toHaveProperty(DueDateEnum.DUE_DAYS_LOCATION_CHECK)
  })

  it('updates internal state when deadlines prop changes', async () => {
    const newDeadlines = {
      ...mockDeadlines,
      [DueDateEnum.DUE_DAYS_FDPG_CHECK]: '2024-04-01T08:00:00.000Z',
    }

    await wrapper.setProps({ deadlines: newDeadlines })

    const keys = Object.keys(wrapper.vm.proposalDeadlines)
    expect(keys).toContain(DueDateEnum.DUE_DAYS_FDPG_CHECK)
    expect(keys).toContain(DueDateEnum.DUE_DAYS_LOCATION_CHECK)
  })

  it('correctly computes deadlineOrderList based on status and deadlines with FdpgCheck status', () => {
    const fdpgCheckWrapper: any = mount(FdpgChangeDeadlines, {
      props: {
        deadlines: mockDeadlines,
        status: ProposalStatus.FdpgCheck,
      },
      global: {
        mocks: { $t },
      },
    })

    const orderList = fdpgCheckWrapper.vm.deadlineOrderList

    expect(orderList).toHaveLength(2)

    expect(orderList[0].deadlineType).toBe(DueDateEnum.DUE_DAYS_FDPG_CHECK)
    expect(orderList[0].isLocked).toBe(false)

    expect(orderList[1].deadlineType).toBe(DueDateEnum.DUE_DAYS_LOCATION_CHECK)
    expect(orderList[1].isLocked).toBe(true)
  })

  it('handles empty deadlines object properly', () => {
    const emptyWrapper: any = mount(FdpgChangeDeadlines, {
      props: {
        deadlines: {},
        status: ProposalStatus.Draft,
      },
      global: {
        mocks: { $t },
      },
    })

    expect(emptyWrapper.vm.deadlineOrderList).toHaveLength(0)
  })
})
