import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/vue'
import ElementPlus from 'element-plus'
import { createTestingPinia } from '@pinia/testing'
import DmsRequestOverview from '@/components/DataDelivery/DmsRequestOverview.vue'
import { useMockLocationStore } from '@/stores/locations/__mocks__/location.store'
import type { IDataDelivery } from '@/types/proposal.types'

vi.mock('vue-i18n', () => ({
  useI18n: vi.fn(() => ({
    t: (key: string) => key,
    locale: { value: 'de-DE' },
  })),
}))

vi.mock('@/stores/locations/location.store', () => ({
  useLocationStore: vi.fn().mockImplementation(() => useMockLocationStore),
}))

vi.mock('@/utils/date.util.ts', () => ({
  getLocaleDateString: (date: Date) => `LOC_${date.toISOString().slice(0, 10)}`,
}))

const renderComponent = (props: { dataDelivery: IDataDelivery | null }) => {
  return render(DmsRequestOverview, {
    props,
    global: {
      plugins: [createTestingPinia(), ElementPlus],
    },
  })
}

describe('DmsRequestOverview.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    // Set a deterministic "now" for all date computations inside the component
    vi.setSystemTime(new Date('2025-01-10T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the table when dataDelivery exists', () => {
    // FIX: Pass a valid dataDelivery object, not null
    renderComponent({
      dataDelivery: {
        dataManagementSite: 'DMS Test',
        acceptance: 'PENDING',
        createdAt: '2025-01-08T00:00:00.000Z',
      },
    })

    expect(screen.getByRole('columnheader', { name: 'dataDelivery.dataManagementSite' })).toBeVisible()
    expect(screen.getByRole('columnheader', { name: 'dataDelivery.requestStatus' })).toBeVisible()
    expect(screen.getByRole('columnheader', { name: 'dataDelivery.dueDate' })).toBeVisible()
  })

  it('does not render anything when dataDelivery is null', () => {
    renderComponent({ dataDelivery: null })

    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('shows data management site name and status badge with variant', () => {
    renderComponent({
      dataDelivery: {
        dataManagementSite: 'DMS Alpha',
        acceptance: 'ACCEPTED',
        createdAt: '2025-01-08T00:00:00.000Z',
      },
    })

    const siteCell = screen.getAllByRole('cell')[0]
    expect(siteCell).toHaveTextContent('DMS Alpha')

    const badge = screen.getByText('dataDelivery.ACCEPTED')
    expect(badge).toBeVisible()
  })

  it('uses createdAt as base date (preferred) to compute due date (+3 days, month/year from "now")', () => {
    renderComponent({
      dataDelivery: {
        dataManagementSite: 'DMS Alpha',
        acceptance: 'PENDING',
        createdAt: '2025-01-08T00:00:00.000Z', // baseDate day = 8
        updatedAt: '2025-01-09T00:00:00.000Z',
      },
    })

    const dueCell = screen.getAllByRole('cell')[2]
    expect(dueCell).toHaveTextContent('LOC_2025-01-11')
    expect(dueCell).toHaveAttribute('data-expired', 'false')
  })

  it('marks the due date as expired when now is after the computed due date', () => {
    // set "now" to 2025-01-15 so any due date <= 14 is expired
    vi.setSystemTime(new Date('2025-01-15T12:00:00.000Z'))

    renderComponent({
      dataDelivery: {
        dataManagementSite: 'DMS Gamma',
        acceptance: 'PENDING',
        createdAt: '2025-01-08T00:00:00.000Z', // due -> 2025-01-11 per component logic
      },
    })

    const dueCell = screen.getAllByRole('cell')[2]
    expect(dueCell).toHaveTextContent('LOC_2025-01-11')
    expect(dueCell).toHaveAttribute('data-expired', 'true')
  })

  it('renders empty due date cell when both createdAt and updatedAt are missing', () => {
    renderComponent({
      dataDelivery: {
        dataManagementSite: 'DMS Delta',
        acceptance: 'DENIED',
        createdAt: undefined,
        updatedAt: undefined,
      },
    })

    const row = screen.getAllByRole('row')[1] // Get body row
    const dueCell = within(row).getAllByRole('cell')[2]
    expect(dueCell.textContent?.trim()).toBe('')
    expect(dueCell).toHaveAttribute('data-expired', 'false')
  })

  it('renders status text for each acceptance value and sets data-variant accordingly', async () => {
    const cases: Array<'PENDING' | 'ACCEPTED' | 'DENIED'> = ['PENDING', 'ACCEPTED', 'DENIED']
    const { rerender } = renderComponent({
      dataDelivery: {
        dataManagementSite: 'DMS Any',
        acceptance: cases[0], // Start with the first case
        createdAt: '2025-01-08T00:00:00.000Z',
      },
    })

    for (const variant of cases) {
      if (variant !== cases[0]) {
        await rerender({
          dataDelivery: {
            dataManagementSite: 'DMS Any',
            acceptance: variant,
            createdAt: '2025-01-08T00:00:00.000Z',
          },
        })
      }

      const badge = await screen.findByText(`dataDelivery.${variant}`)
      expect(badge).toBeVisible()
    }
  })
})
