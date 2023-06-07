import { useFeasibilityStore } from './feasibility.store'
import { FeasibilityService } from '@/services/feasibility/feasibility.service'
import { createPinia, setActivePinia } from 'pinia'
import type { IFeasibilityDetail } from '@/types/feasibility-detail.interface'

vi.mock('@/services/feasibility/feasibility.service')

const feasibilityService = vi.mocked(new FeasibilityService())

describe('Feasibility Store', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
  })

  it('renders', () => {
    const store = useFeasibilityStore()
    expect(store).toBeTruthy()
  })

  describe('GetAll', () => {
    it('should call the service to get all feasibility', async () => {
      const store = useFeasibilityStore()
      feasibilityService.getAll.mockResolvedValueOnce([
        {
          id: 2,
          label: 'string',
          createdAt: 'string',
        },
      ] as IFeasibilityDetail[])
      await store.getAll()
      expect(feasibilityService.getAll).toHaveBeenCalledTimes(1)
      expect(store.feasibilityQueries).toEqual([
        {
          id: 2,
          label: 'string',
          createdAt: 'string',
        },
      ] as IFeasibilityDetail[])
    })
  })
})
