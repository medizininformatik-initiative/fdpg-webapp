import type { IMessageBox} from './messageBox.store';
import { useMessageBoxStore } from './messageBox.store'
import { createPinia, setActivePinia } from 'pinia'

describe('MessageBox Store', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
  })

  it('renders', () => {
    const store = useMessageBoxStore()
    expect(store).toBeTruthy()
  })

  describe('isOpen', () => {
    it('should set the value of isOpen with actions', async () => {
      const store = useMessageBoxStore()
      store.isOpen = false
      await store.openMessageBox()
      expect(store.isOpen).toBe(true)
      await store.closeMessageBox()
      expect(store.isOpen).toBe(false)
    })
  })

  it('should set message box', async () => {
    const store = useMessageBoxStore()
    store.isOpen = false
    vi.spyOn(store, 'openMessageBox').mockImplementation()
    await store.setMessageBoxInfo({
      cancelButtonText: 'proposal.no',
      cancelButtonClass: 'string',
      showCancelButton: true,
      title: 'proposal.no',
      message: 'proposal.no',
      confirmButtonText: 'proposal.no',
      callback: () => {},
    } as IMessageBox)
    expect(store.openMessageBox).toBeCalledTimes(1)
  })
})
