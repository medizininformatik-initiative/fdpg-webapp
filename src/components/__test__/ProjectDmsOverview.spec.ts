import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/vue'
import ElementPlus from 'element-plus'
import { createTestingPinia } from '@pinia/testing'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import type { IProposal } from '@/types/proposal.types.ts'
import { merge } from 'lodash-es'
import ProjectDMSOverview from '@/components/DataDelivery/ProjectDMSOverview.vue'

vi.mock('vue-i18n', () => ({
  useI18n: vi.fn(() => ({
    t: (key: string) => key,
    locale: { value: 'de-DE' },
  })),
}))

describe('ProjectDmsOverview.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders section heading', () => {
    setup()

    const heading = screen.getByRole('heading', {
      name: 'dataDelivery.dataManagementSiteAbbreviation',
      level: 2,
    })
    expect(heading).toBeVisible()
  })

  it('renders MissingDataDeliverySetup when dataDelivery is undefined', () => {
    setup({
      proposal: { _id: 'P-1', dataDelivery: undefined } as IProposal,
    })

    expect(screen.getByTestId('missing-dms')).toBeVisible()
    expect(screen.queryByTestId('overview')).not.toBeInTheDocument()
    expect(screen.queryByTestId('request-new')).not.toBeInTheDocument()
  })

  it('renders MissingDataDeliverySetup when dataDelivery is null', () => {
    setup({
      proposal: { _id: 'P-2', dataDelivery: null } as IProposal,
    })

    expect(screen.getByTestId('missing-dms')).toBeVisible()
    expect(screen.queryByTestId('overview')).not.toBeInTheDocument()
    expect(screen.queryByTestId('request-new')).not.toBeInTheDocument()
  })

  it('renders DmsRequestOverview and RequestNewDms when dataDelivery exists', () => {
    setup({
      proposal: {
        _id: 'P-3',
        dataDelivery: {
          dataManagementSite: 'DMS Alpha',
          acceptance: 'PENDING',
          createdAt: '2025-01-08T00:00:00.000Z',
        },
      } as IProposal,
    })

    expect(screen.queryByTestId('missing-dms')).not.toBeInTheDocument()
    expect(screen.getByTestId('overview')).toBeVisible()
    expect(screen.getByTestId('request-new')).toBeVisible()
  })
})

interface SetupInput {
  proposal: IProposal
}

const MissingStub = { name: 'MissingDataDeliverySetup', template: `<div data-testid="missing-dms" />` }
const OverviewStub = { name: 'DmsRequestOverview', template: `<div data-testid="overview" />` }
const RequestNewStub = { name: 'RequestNewDms', template: `<div data-testid="request-new" />` }

const setup = (setupInput: Partial<SetupInput> = {}) => {
  const defaults: Required<SetupInput> = {
    proposal: {
      _id: 'P-Default',
      dataDelivery: undefined,
    } as IProposal,
  }

  const merged = merge({}, defaults, setupInput)

  const pinia = createTestingPinia({ createSpy: vi.fn })
  const proposalStore = useProposalStore(pinia)
  proposalStore.currentProposal = merged.proposal

  return render(ProjectDMSOverview, {
    global: {
      plugins: [pinia, ElementPlus],
      // Stub children so assertions focus on parent’s conditional rendering
      stubs: {
        MissingDataDeliverySetup: MissingStub,
        DmsRequestOverview: OverviewStub,
        RequestNewDms: RequestNewStub,
      },
    },
  })
}
