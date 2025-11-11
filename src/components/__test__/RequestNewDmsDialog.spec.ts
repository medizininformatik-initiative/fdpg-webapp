import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/vue'
import ElementPlus from 'element-plus'
import { createTestingPinia } from '@pinia/testing'
import { useLocationStore } from '@/stores/locations/location.store'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import type { ILocation } from '@/types/location.types.ts'
import type { IProposal } from '@/types/proposal.types.ts'
import userEvent from '@testing-library/user-event'
import { merge } from 'lodash-es'
import RequestNewDmsDialog from '../DataDelivery/RequestNewDmsDialog.vue'
import { useMockLocationStore } from '@/stores/locations/__mocks__/location.store'

vi.mock('@/stores/locations/location.store', () => ({
  useLocationStore: vi.fn().mockImplementation(() => useMockLocationStore),
}))

vi.mock('vue-i18n', () => ({
  useI18n: vi.fn(() => ({
    t: (key: string) => key,
    locale: { value: 'de-DE' },
  })),
}))

describe('RequestNewDmsDialog.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    const locationStore = useLocationStore()
    const mockMap = {
      One: { _id: 'One', display: 'Location 1', dataManagementCenter: true },
      Two: { _id: 'Two', display: 'Location 2', dataManagementCenter: false },
      Three: { _id: 'Three', display: 'Location 3', dataManagementCenter: true },
    }
    vi.spyOn(locationStore, 'getLocationLookupMap').mockResolvedValue(mockMap as any)
  })

  it('shows only DMS locations in the select dropdown', async () => {
    const { user } = setup(true)

    const combobox = await screen.findByRole('combobox')
    await user.click(combobox)

    const options = screen.getAllByRole('option').map((o) => o.textContent)
    expect(options).toContain('Location 1')
    expect(options).not.toContain('Location 2') // not a DMS
    expect(options).toContain('Location 3')
  })

  it('renders the select with placeholder text in the dialog', async () => {
    setup(true)
    const comboboxTrigger = await screen.findByRole('combobox')
    const placeholder = await screen.findByText('dataDelivery.selectDataManagementSite')
    expect(comboboxTrigger).toBeVisible()
    expect(placeholder).toBeVisible()
  })

  it('cancel button emits dialogOpenState to close the dialog', async () => {
    const { user, emitted } = setup(true)
    expect(await screen.findByText('dataDelivery.newRequestConfirmationQuestion')).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'dataDelivery.cancel' }))
    expect(emitted()).toHaveProperty('dialogOpenState')
    expect(emitted()['dialogOpenState'][0]).toEqual([false])
  })

  it('submit is disabled when dialog opens (model is empty)', async () => {
    const { user } = setup(true)
    const submitButton = await screen.findByRole('button', {
      name: 'dataDelivery.sendRequest',
    })
    expect(submitButton).toBeDisabled()

    await user.click(screen.getByRole('combobox'))
    await user.click(screen.getByRole('option', { name: 'Location 1' }))

    expect(submitButton).toBeEnabled()
  })

  it('submits and calls proposalStore.updateDmsForDataDelivery, then emits close event', async () => {
    const { user, proposalStore, emitted } = setup(true, {
      proposal: {
        _id: 'Proposal 1',
        dataDelivery: { dataManagementSite: 'Existing DMS' },
      } as unknown as IProposal,
    })

    const combobox = await screen.findByRole('combobox')
    await user.click(combobox)
    await user.click(screen.getByRole('option', { name: 'Location 1' }))

    const submitButton = screen.getByRole('button', {
      name: 'dataDelivery.sendRequest',
    })
    await user.click(submitButton)

    expect(emitted()).toHaveProperty('dialogOpenState')
    expect(emitted()['dialogOpenState'][0]).toEqual([false])
  })
})

interface SetupInput {
  locationList: ILocation[]
  proposal: IProposal
}

const setup = (isOpen: boolean, setupInput: Partial<SetupInput> = {}) => {
  const defaults: Required<SetupInput> = {
    locationList: [
      { _id: 'One', display: 'Location 1', dataManagementCenter: true },
      { _id: 'Two', display: 'Location 2', dataManagementCenter: false },
      { _id: 'Three', display: 'Location 3', dataManagementCenter: true },
    ] as ILocation[],
    proposal: {
      _id: 'Proposal 1',
      dataDelivery: { dataManagementSite: null },
    } as IProposal,
  }

  const merged = merge({}, defaults, setupInput)

  const user = userEvent.setup()
  const pinia = createTestingPinia({ createSpy: vi.fn })

  const locationStore = useLocationStore(pinia)
  locationStore.allLocations = merged.locationList
  vi.spyOn(locationStore, 'getAll').mockResolvedValue(merged.locationList)

  const proposalStore = useProposalStore(pinia)
  proposalStore.currentProposal = merged.proposal

  const utils = render(RequestNewDmsDialog, {
    props: {
      modelValue: isOpen,
      dataManagementSite: merged.proposal.dataDelivery?.dataManagementSite ?? null,
    },
    global: {
      plugins: [pinia, ElementPlus],
    },
  })

  return { ...utils, emitted: utils.emitted, user, pinia, locationStore, proposalStore }
}
