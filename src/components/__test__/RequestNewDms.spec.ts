import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/vue'
import ElementPlus from 'element-plus'
import { createTestingPinia } from '@pinia/testing'
import { useLocationStore } from '@/stores/locations/location.store'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import type { ILocation } from '@/types/location.types.ts'
import type { IProposal } from '@/types/proposal.types.ts'
import RequestNewDms from '@/components/DataDelivery/RequestNewDms.vue'
import userEvent from '@testing-library/user-event'
import { merge } from 'lodash-es'

vi.mock('vue-i18n', () => ({
  useI18n: vi.fn(() => ({
    t: (key: string) => key,
    locale: { value: 'de-DE' },
  })),
}))

describe('RequestNewDms.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the “request new DMS” link when a current DMS exists', () => {
    setup()

    const resetLink = screen.getByRole('button', { name: 'dataDelivery.newRequest' })
    expect(resetLink).toBeVisible()
  })

  it('opens the confirmation dialog when clicking the link', async () => {
    const { user } = setup()

    await user.click(screen.getByRole('button', { name: 'dataDelivery.newRequest' }))

    expect(screen.getByText('dataDelivery.newRequestConfirmationQuestion')).toBeVisible()
  })

  it('requests all locations from the store on mount', () => {
    const { locationStore } = setup()
    expect(locationStore.getAll).toHaveBeenCalledTimes(1)
  })

  it('shows only DMS locations in the select dropdown', async () => {
    const { user } = setup()

    await user.click(screen.getByRole('button', { name: 'dataDelivery.newRequest' }))
    await user.click(screen.getByRole('combobox'))

    const options = screen.getAllByRole('option').map((o) => o.textContent)
    expect(options).toContain('Location 1')
    expect(options).not.toContain('Location 2') // not a DMS
    expect(options).toContain('Location 3')
  })

  it('renders the select with placeholder text in the dialog', async () => {
    const { user } = setup()

    await user.click(screen.getByRole('button', { name: 'dataDelivery.newRequest' }))

    const comboboxTrigger = screen.getByRole('combobox')
    const placeholder = screen.getByText('dataDelivery.selectDataManagementSite')
    expect(comboboxTrigger).toBeVisible()
    expect(placeholder).toBeVisible()
  })

  it('cancel button closes the dialog', async () => {
    const { user } = setup()

    await user.click(screen.getByRole('button', { name: 'dataDelivery.newRequest' }))
    expect(screen.getByText('dataDelivery.newRequestConfirmationQuestion')).toBeVisible()

    await user.click(screen.getByRole('button', { name: 'dataDelivery.cancel' }))
    expect(screen.queryByText('dataDelivery.newRequestConfirmationQuestion')).not.toBeInTheDocument()
  })

  it('submit is disabled when dialog opens (model is empty)', async () => {
    const { user } = setup()

    await user.click(screen.getByRole('button', { name: 'dataDelivery.newRequest' }))

    const submitButton = screen.getByRole('button', { name: 'dataDelivery.sendRequest' })
    expect(submitButton).toBeDisabled()

    await user.click(screen.getByRole('combobox'))
    await user.click(screen.getByRole('option', { name: 'Location 1' }))

    expect(submitButton).toBeEnabled()
  })

  it('submits and calls proposalStore.updateDmsForDataDelivery, then closes the dialog', async () => {
    const { user, proposalStore } = setup({
      proposal: {
        _id: 'Proposal 1',
        dataDelivery: { dataManagementSite: 'Existing DMS' },
      } as unknown as IProposal,
    })

    await user.click(screen.getByRole('button', { name: 'dataDelivery.newRequest' }))

    await user.click(screen.getByRole('combobox'))
    await user.click(screen.getByRole('option', { name: 'Location 1' }))

    const submitButton = screen.getByRole('button', { name: 'dataDelivery.sendRequest' })
    await user.click(submitButton)

    expect(proposalStore.updateDmsForDataDelivery).toHaveBeenCalledTimes(1)
    expect(proposalStore.updateDmsForDataDelivery).toHaveBeenCalledWith('Proposal 1', 'One')
    expect(screen.queryByText('dataDelivery.newRequestConfirmationQuestion')).not.toBeInTheDocument()
  })
})

interface SetupInput {
  locationList: ILocation[]
  proposal: IProposal
}

const setup = (setupInput: Partial<SetupInput> = {}) => {
  const defaults: Required<SetupInput> = {
    locationList: [
      { _id: 'One', display: 'Location 1', dataManagementCenter: true },
      { _id: 'Two', display: 'Location 2', dataManagementCenter: false },
      { _id: 'Three', display: 'Location 3', dataManagementCenter: true },
    ] as ILocation[],
    proposal: {
      _id: 'Proposal 1',
      dataDelivery: { dataManagementSite: 'Existing DMS' },
    } as IProposal,
  }

  const merged = merge({}, defaults, setupInput)

  const user = userEvent.setup()
  const pinia = createTestingPinia({ createSpy: vi.fn })

  const locationStore = useLocationStore(pinia)
  locationStore.allLocations = merged.locationList

  const proposalStore = useProposalStore(pinia)
  proposalStore.currentProposal = merged.proposal

  const utils = render(RequestNewDms, {
    global: {
      plugins: [pinia, ElementPlus],
    },
  })

  return { ...utils, user, pinia, locationStore, proposalStore }
}
