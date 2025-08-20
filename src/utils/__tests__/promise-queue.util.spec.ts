import { UpdateQueue } from '../promise-queue.util'

describe('UpdateQueue', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should deduplicate rapid updates to the same item', async () => {
    const queue = new UpdateQueue()
    const processedItems: any[] = []

    const updateFunction = vi.fn(async (item: any) => {
      processedItems.push(item)
      return item
    })

    // Add same item multiple times rapidly
    queue.update({ id: '1', version: 1 }, updateFunction)
    queue.update({ id: '1', version: 2 }, updateFunction)
    queue.update({ id: '1', version: 3 }, updateFunction)

    // Allow processing to complete
    await vi.runAllTimersAsync()

    // Should process only the latest version
    expect(processedItems).toHaveLength(1)
    expect(processedItems[0]).toEqual({ id: '1', version: 3 })
  })

  it('should handle multiple different items', async () => {
    const queue = new UpdateQueue()
    const processedItems: any[] = []

    const updateFunction = vi.fn(async (item: any) => {
      processedItems.push(item)
      return item
    })

    // Add different items and update one
    queue.update({ id: '1', data: 'first' }, updateFunction)
    queue.update({ id: '2', data: 'second' }, updateFunction)
    queue.update({ id: '1', data: 'updated first' }, updateFunction)

    await vi.runAllTimersAsync()

    // Should process 2 items (latest version of each unique id)
    expect(processedItems).toHaveLength(2)
    expect(processedItems).toContainEqual({ id: '2', data: 'second' })
    expect(processedItems).toContainEqual({ id: '1', data: 'updated first' })
  })

  it('should use the latest update function for all items in batch', async () => {
    const queue = new UpdateQueue()
    const results: string[] = []

    const updateFunction1 = vi.fn(async (item: any) => {
      results.push(`func1: ${item.id}`)
      return item
    })

    const updateFunction2 = vi.fn(async (item: any) => {
      results.push(`func2: ${item.id}`)
      return item
    })

    // Add items with different update functions
    queue.update({ id: '1' }, updateFunction1)
    queue.update({ id: '2' }, updateFunction2) // This function will be used for all

    await vi.runAllTimersAsync()

    // Latest update function should be used for all items
    expect(results).toEqual(['func2: 1', 'func2: 2'])
  })

  it('should handle errors silently and continue processing other items', async () => {
    const queue = new UpdateQueue()
    const processedItems: any[] = []

    const updateFunction = vi.fn(async (item: any) => {
      if (item.shouldFail) {
        throw new Error('Update failed')
      }
      processedItems.push(item)
      return item
    })

    // Intentionally catch the rejection from the first item to avoid unhandled rejection in test runner
    await expect(queue.update({ id: '1', shouldFail: true }, updateFunction)).rejects.toBeInstanceOf(Error)
    await expect(queue.update({ id: '2', shouldFail: false }, updateFunction)).resolves.toBeDefined()

    await vi.runAllTimersAsync()

    // Should process the successful item despite the error
    expect(processedItems).toHaveLength(1)
    expect(processedItems[0]).toEqual({ id: '2', shouldFail: false })
  })

  it('should demonstrate the checkbox scenario efficiency', async () => {
    const queue = new UpdateQueue()
    const apiCalls: any[] = []

    const saveCheckbox = vi.fn(async (item: any) => {
      apiCalls.push(item)
      return item
    })

    // Simulate rapid checkbox clicks
    queue.update({ id: 'checkbox1', checked: true }, saveCheckbox)
    queue.update({ id: 'checkbox1', checked: false }, saveCheckbox)
    queue.update({ id: 'checkbox1', checked: true }, saveCheckbox)
    queue.update({ id: 'checkbox1', checked: false }, saveCheckbox)
    queue.update({ id: 'checkbox1', checked: true }, saveCheckbox)

    await vi.runAllTimersAsync()

    // Should make only 1 API call with the final state
    expect(apiCalls).toHaveLength(1)
    expect(apiCalls[0]).toEqual({ id: 'checkbox1', checked: true })
  })

  it('should clear pending items when cleared', () => {
    const queue = new UpdateQueue()

    queue.update({ id: '1' }, vi.fn())
    queue.update({ id: '2' }, vi.fn())

    expect(queue.pending).toBeGreaterThan(0)

    queue.clear()

    expect(queue.pending).toBe(0)
  })

  it('should return immediately if already processing', async () => {
    const queue = new UpdateQueue()
    let processingStarted = false
    let firstCallResolved = false

    const slowUpdateFunction = vi.fn(async (item: any) => {
      processingStarted = true
      // Simulate slow operation
      await new Promise((resolve) => setTimeout(resolve, 100))
      return item
    })

    const fastUpdateFunction = vi.fn(async (item: any) => {
      return item
    })

    const promise1 = queue.update({ id: '1' }, slowUpdateFunction)

    await vi.advanceTimersByTimeAsync(50)
    expect(processingStarted).toBe(true)

    const promise2 = queue.update({ id: '2' }, fastUpdateFunction)

    promise2.then(() => {
      firstCallResolved = true
    })

    await vi.runAllTimersAsync()

    expect(firstCallResolved).toBe(true)
  })
})
