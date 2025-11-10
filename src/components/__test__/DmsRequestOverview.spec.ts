import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/vue'
import ElementPlus from 'element-plus'
import { createTestingPinia } from '@pinia/testing'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import type { IProposal } from '@/types/proposal.types.ts'
import DmsRequestOverview from '@/components/DataDelivery/DmsRequestOverview.vue'
import { merge } from 'lodash-es'

vi.mock('vue-i18n', () => ({
  useI18n: vi.fn(() => ({
    t: (key: string) => key,
    locale: { value: 'de-DE' },
  })),
}))

// mock date util to produce a stable, inspectable output from the Date passed in
vi.mock('@/utils/date.util.ts', () => ({
  getLocaleDateString: (date: Date) => `LOC_${date.toISOString().slice(0, 10)}`,
}))

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
    setup()

    expect(screen.getByRole('columnheader', { name: 'dataDelivery.dataManagementSite' })).toBeVisible()
    expect(screen.getByRole('columnheader', { name: 'dataDelivery.requestStatus' })).toBeVisible()
    expect(screen.getByRole('columnheader', { name: 'dataDelivery.dueDate' })).toBeVisible()
  })

  it('does not render anything when dataDelivery is null', () => {
    setup({
      proposal: { _id: 'P-Default', dataDelivery: null } as IProposal,
    })

    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('shows data management site name and status badge with variant', () => {
    setup({
      proposal: {
        _id: 'P-2',
        dataDelivery: {
          dataManagementSite: 'DMS Alpha',
          acceptance: 'ACCEPTED',
          createdAt: '2025-01-08T00:00:00.000Z',
        },
      } as IProposal,
    })

    const siteCell = screen.getAllByRole('cell')[0]
    expect(siteCell).toHaveTextContent('DMS Alpha')

    const badge = screen.getByText('dataDelivery.ACCEPTED')
    expect(badge).toBeVisible()
    expect(badge).toHaveAttribute('data-variant', 'ACCEPTED')
  })

  it('uses createdAt as base date (preferred) to compute due date (+3 days, month/year from "now")', () => {
    setup({
      proposal: {
        _id: 'P-3',
        dataDelivery: {
          dataManagementSite: 'DMS Alpha',
          acceptance: 'PENDING',
          createdAt: '2025-01-08T00:00:00.000Z', // baseDate day = 8
          updatedAt: '2025-01-09T00:00:00.000Z',
        },
      } as IProposal,
    })

    const dueCell = screen.getAllByRole('cell')[2]
    expect(dueCell).toHaveTextContent('LOC_2025-01-11')
    expect(dueCell).toHaveAttribute('data-expired', 'false')
  })

  it('marks the due date as expired when now is after the computed due date', () => {
    // set "now" to 2025-01-15 so any due date <= 14 is expired
    vi.setSystemTime(new Date('2025-01-15T12:00:00.000Z'))

    setup({
      proposal: {
        _id: 'P-5',
        dataDelivery: {
          dataManagementSite: 'DMS Gamma',
          acceptance: 'PENDING',
          createdAt: '2025-01-08T00:00:00.000Z', // due -> 2025-01-11 per component logic
        },
      } as IProposal,
    })

    const dueCell = screen.getAllByRole('cell')[2]
    expect(dueCell).toHaveTextContent('LOC_2025-01-11')
    expect(dueCell).toHaveAttribute('data-expired', 'true')
  })

  it('renders empty due date cell when both createdAt and updatedAt are missing', () => {
    setup({
      proposal: {
        _id: 'P-6',
        dataDelivery: {
          dataManagementSite: 'DMS Delta',
          acceptance: 'DENIED',
          createdAt: undefined,
          updatedAt: undefined,
        },
      } as unknown as IProposal,
    })

    const row = screen.getAllByRole('row')[1]
    const dueCell = within(row).getAllByRole('cell')[2]
    expect(dueCell.textContent?.trim()).toBe('')
    expect(dueCell).toHaveAttribute('data-expired', 'false')
  })

  it('renders status text for each acceptance value and sets data-variant accordingly', () => {
    const cases: Array<'PENDING' | 'ACCEPTED' | 'DENIED'> = ['PENDING', 'ACCEPTED', 'DENIED']

    for (const variant of cases) {
      setup({
        proposal: {
          _id: `P-${variant}`,
          dataDelivery: {
            dataManagementSite: 'DMS Any',
            acceptance: variant,
            createdAt: '2025-01-08T00:00:00.000Z',
          },
        } as IProposal,
      })

      const badge = screen.getByText(`dataDelivery.${variant}`)
      expect(badge).toHaveAttribute('data-variant', variant)
    }
  })
})

interface SetupInput {
  proposal: IProposal
}

const setup = (setupInput: Partial<SetupInput> = {}) => {
  const defaults: Required<SetupInput> = {
    proposal: {
      _id: 'P-Default',
      dataDelivery: {},
    } as IProposal,
  }

  const merged = merge({}, defaults, setupInput)

  const pinia = createTestingPinia({ createSpy: vi.fn })
  const proposalStore = useProposalStore(pinia)
  proposalStore.currentProposal = merged.proposal

  const utils = render(DmsRequestOverview, {
    global: {
      plugins: [pinia, ElementPlus],
    },
  })

  return { ...utils, pinia, proposalStore }
}
