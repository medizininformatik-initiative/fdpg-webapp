import { UpdateQueue } from '../promise-queue.util'

describe('UpdateQueue', () => {
  it('should process only the latest version of an item', async () => {
    const queue = new UpdateQueue()
    const processedItems: any[] = []

    const updateFunction = vi.fn(async (item: any) => {
      processedItems.push(item)
      return item
    })

    // Add same item multiple times with different versions
    const promise1 = queue.update({ id: '1', version: 1 }, updateFunction)
    const promise2 = queue.update({ id: '1', version: 2 }, updateFunction)
    const promise3 = queue.update({ id: '1', version: 3 }, updateFunction)

    // Wait for all promises
    const results = await Promise.all([promise1, promise2, promise3])

    // Should have processed only the latest version once
    expect(processedItems).toHaveLength(1)
    expect(processedItems[0]).toEqual({ id: '1', version: 3 })

    // All promises should resolve with the same result
    expect(results).toEqual([
      { id: '1', version: 3 },
      { id: '1', version: 3 },
      { id: '1', version: 3 },
    ])
  })

  it('should handle multiple different items correctly', async () => {
    const queue = new UpdateQueue()
    const processedItems: any[] = []

    const updateFunction = vi.fn(async (item: any) => {
      processedItems.push(item)
      return item
    })

    // Add different items
    const promise1 = queue.update({ id: '1', data: 'first' }, updateFunction)
    const promise2 = queue.update({ id: '2', data: 'second' }, updateFunction)
    const promise3 = queue.update({ id: '1', data: 'updated first' }, updateFunction)

    const results = await Promise.all([promise1, promise2, promise3])

    // Should have processed both items
    expect(processedItems).toHaveLength(2)
    expect(processedItems).toContainEqual({ id: '2', data: 'second' })
    expect(processedItems).toContainEqual({ id: '1', data: 'updated first' })

    // Promises should resolve correctly
    expect(results[0]).toEqual({ id: '1', data: 'updated first' }) // Latest version of item 1
    expect(results[1]).toEqual({ id: '2', data: 'second' })
    expect(results[2]).toEqual({ id: '1', data: 'updated first' })
  })

  it('should handle errors correctly', async () => {
    const queue = new UpdateQueue()

    const updateFunction = vi.fn(async (item: any) => {
      if (item.shouldFail) {
        throw new Error('Update failed')
      }
      return item
    })

    const promise1 = queue.update({ id: '1', shouldFail: true }, updateFunction)
    const promise2 = queue.update({ id: '1', shouldFail: true }, updateFunction) // Same item, should also fail
    const promise3 = queue.update({ id: '2', shouldFail: false }, updateFunction) // Different item, should succeed

    // First two should reject, third should resolve
    await expect(promise1).rejects.toThrow('Update failed')
    await expect(promise2).rejects.toThrow('Update failed')
    await expect(promise3).resolves.toEqual({ id: '2', shouldFail: false })
  })

  it('should handle different update functions per item', async () => {
    const queue = new UpdateQueue()
    const results: any[] = []

    const updateFunction1 = vi.fn(async (item: any) => {
      results.push(`func1: ${item.id}`)
      return `result1: ${item.id}`
    })

    const updateFunction2 = vi.fn(async (item: any) => {
      results.push(`func2: ${item.id}`)
      return `result2: ${item.id}`
    })

    // Same item but different update functions - latest should win
    const promise1 = queue.update({ id: '1' }, updateFunction1)
    const promise2 = queue.update({ id: '1' }, updateFunction2)

    const [result1, result2] = await Promise.all([promise1, promise2])

    // Should have used the latest update function (updateFunction2)
    expect(results).toEqual(['func2: 1'])
    expect(result1).toBe('result2: 1')
    expect(result2).toBe('result2: 1')
  })

  it('should clear pending promises when cleared', async () => {
    const queue = new UpdateQueue()

    const updateFunction = vi.fn(async (item: any) => {
      // This should never be called
      return item
    })

    const promise = queue.update({ id: '1' }, updateFunction)

    // Clear the queue immediately
    queue.clear()

    // Promise should be rejected
    await expect(promise).rejects.toThrow('Queue cleared')
    expect(updateFunction).not.toHaveBeenCalled()
  })
})
