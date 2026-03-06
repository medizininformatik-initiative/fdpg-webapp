import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/vue'
import ElementPlus from 'element-plus'
import { createTestingPinia } from '@pinia/testing'
import { useLocationStore } from '@/stores/locations/location.store'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import type { ILocation } from '@/types/location.types.ts'
import type { IProposal } from '@/types/proposal.types.ts'
import MissingDataDeliverySetup from '@/components/DataDelivery/MissingDataDeliverySetup.vue'
import userEvent from '@testing-library/user-event'
import { merge } from 'lodash-es'

vi.mock('vue-i18n', () => ({
  useI18n: vi.fn(() => ({
    t: (key: string) => key,
    locale: { value: 'de-DE' },
  })),
}))

describe('MissingDataDeliverySetup.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders section title as heading', () => {
    setup()

    const heading = screen.getByRole('heading', { name: 'dataDelivery.dataManagementSite', level: 3 })

    expect(heading).toBeVisible()
  })

  it('renders combobox and related placeholder', () => {
    setup()

    const comboboxTrigger = screen.getByRole('combobox')
    const placeholder = screen.getByText('dataDelivery.selectDataManagementSite')

    expect(comboboxTrigger).toBeVisible()
    expect(placeholder).toBeVisible()
  })

  it('requests all locations from store', () => {
    const { locationStore } = setup()

    expect(locationStore.getAll).toHaveBeenCalledTimes(1)
  })

  it('shows only DMS locations in the dropdown options', async () => {
    const { user } = setup()

    await user.click(screen.getByRole('combobox'))

    const comboboxOptionList = screen.getAllByRole('option').map((optionElement) => optionElement.textContent)

    expect(comboboxOptionList).toContain('Location 1')
    expect(comboboxOptionList).not.toContain('Location 2') // not a DMS
    expect(comboboxOptionList).toContain('Location 3')
  })

  it('has a disabled submit button while no location is selected', async () => {
    setup()

    const submitButton = screen.getByRole('button', { name: 'dataDelivery.sendRequest' })

    expect(submitButton).toBeDisabled()
  })

  it('has an enabled submit button when a location is selected', async () => {
    const { user } = setup()

    await user.click(screen.getByRole('combobox'))
    const locationOneOption = screen.getByRole('option', { name: 'Location 1' })
    await user.click(locationOneOption)

    const submitButton = screen.getByRole('button', { name: 'dataDelivery.sendRequest' })

    expect(submitButton).toBeEnabled()
  })
})

interface SetupInput {
  locationList: ILocation[]
  proposal: IProposal
}

const setup = (setupInput: Partial<SetupInput> = {}) => {
  const defaults: Required<SetupInput> = {
    locationList: [
      {
        _id: 'One',
        display: 'Location 1',
        dataManagementCenter: true,
      },
      {
        _id: 'Two',
        display: 'Location 2',
        dataManagementCenter: false,
      },
      {
        _id: 'Three',
        display: 'Location 3',
        dataManagementCenter: true,
      },
    ] as ILocation[],
    proposal: { _id: 'Proposal 1' } as IProposal,
  }

  const mergedSetupInput = merge({}, defaults, setupInput)

  const user = userEvent.setup()
  const pinia = createTestingPinia({
    createSpy: vi.fn,
  })

  const locationStore = useLocationStore(pinia)
  locationStore.allLocations = mergedSetupInput.locationList

  const proposalStore = useProposalStore(pinia)
  proposalStore.currentProposal = mergedSetupInput.proposal

  const utils = render(MissingDataDeliverySetup, {
    global: {
      plugins: [pinia, ElementPlus],
    },
  })

  return { ...utils, user, pinia, locationStore, proposalStore }
}
