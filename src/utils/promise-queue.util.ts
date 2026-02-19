interface QueueItem<T> {
  task: () => Promise<T>
  resolve: (value: T) => void
  reject: (reason?: unknown) => void
}

export class PromiseQueue {
  // The queue can hold tasks with different return types, so `QueueItem<any>` is used internally.
  // Type safety is enforced by the public `add` method's generic signature.
  #queue: QueueItem<any>[] = []
  #isProcessing = false

  /**
   * Adds a promise-returning function to the queue.
   * @param task A function that returns a promise.
   * @returns A promise that resolves or rejects with the result of the task.
   * @template T
   */
  public add<T>(task: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      // Add the task and its promise handlers to the queue.
      this.#queue.push({ task, resolve, reject })
      // Start processing if not already running.
      this.#process()
    })
  }

  /**
   * Gets the current number of tasks waiting in the queue.
   */
  public get size(): number {
    return this.#queue.length
  }

  /**
   * Processes the queue sequentially.
   */
  async #process(): Promise<void> {
    // If another process call is already running, exit.
    if (this.#isProcessing) {
      return
    }

    // Mark the queue as processing.
    this.#isProcessing = true

    // Process tasks as long as the queue is not empty.
    while (this.#queue.length > 0) {
      // The non-null assertion (!) is safe here because of the `while` loop's condition.
      const { task, resolve, reject } = this.#queue.shift()!

      try {
        // Await the task's completion.
        const result = await task()
        // Resolve the promise that was returned by the add() method.
        resolve(result)
      } catch (error) {
        // Reject the promise if the task fails.
        reject(error)
      }
    }

    // Mark the queue as no longer processing.
    this.#isProcessing = false
  }

  clear() {
    this.#queue = []
  }
}

export class UpdateQueue<T = any> {
  private queue = new PromiseQueue()
  private latestItems = new Map<string, { item: T; generation: number }>()
  private processing = false
  private latestUpdateFunction: ((item: T) => Promise<void>) | null = null
  private waiters = new Map<
    string,
    Array<{ generation: number; resolve: (value: unknown) => void; reject: (reason?: unknown) => void }>
  >()
  private generationById = new Map<string, number>()

  async update(item: T, updateFunction: (item: T) => Promise<any>): Promise<any> {
    const itemId = this.getId(item)

    // Store the latest version of this item
    const nextGeneration = (this.generationById.get(itemId) ?? 0) + 1
    this.generationById.set(itemId, nextGeneration)
    this.latestItems.set(itemId, { item, generation: nextGeneration })

    // Store the latest update function
    this.latestUpdateFunction = updateFunction

    const itemPromise = new Promise((resolve, reject) => {
      const list = this.waiters.get(itemId) ?? []
      list.push({ generation: nextGeneration, resolve, reject })
      this.waiters.set(itemId, list)
    })

    void this.processUpdates()

    return itemPromise
  }

  private async processUpdates(): Promise<any> {
    // If already processing, just return - the current processing will handle new items
    if (this.processing) {
      return Promise.resolve()
    }

    this.processing = true

    try {
      // Small delay to allow batching of rapid updates
      await new Promise((resolve) => setTimeout(resolve, 0))

      while (this.latestItems.size > 0) {
        // Get all current items to process
        const itemsToProcess = Array.from(this.latestItems.entries())
        const currentUpdateFunction = this.latestUpdateFunction
        this.latestItems.clear()

        // Process each item sequentially with the latest update function
        if (currentUpdateFunction) {
          for (const [itemId, { item, generation }] of itemsToProcess) {
            try {
              const result = await this.queue.add(() => currentUpdateFunction(item))
              this.resolveWaitersUpToGeneration(itemId, generation, result)
            } catch (error) {
              // Reject waiters for this item, but continue with other items
              this.rejectWaitersUpToGeneration(itemId, generation, error)
            }
          }
        }
      }
    } finally {
      this.processing = false
      // If new items were enqueued during the tiny window after the last check,
      // ensure we spin the processor again to drain them.
      if (this.latestItems.size > 0) {
        void this.processUpdates()
      }
    }
  }

  private getId(item: Record<string, unknown>): string {
    return (item.id as string) || (item._id as string) || JSON.stringify(item)
  }

  clear() {
    this.latestItems.clear()
    this.queue.clear()
    this.processing = false
    this.latestUpdateFunction = null
    this.waiters.clear()
    this.generationById.clear()
  }

  get pending() {
    return this.latestItems.size + this.queue.size
  }

  private resolveWaitersUpToGeneration(itemId: string, generation: number, value: unknown) {
    const list = this.waiters.get(itemId)
    if (!list || list.length === 0) return
    const remaining: typeof list = []
    for (const waiter of list) {
      if (waiter.generation <= generation) {
        try {
          waiter.resolve(value)
        } catch {}
      } else {
        remaining.push(waiter)
      }
    }
    if (remaining.length > 0) {
      this.waiters.set(itemId, remaining)
    } else {
      this.waiters.delete(itemId)
    }
  }

  private rejectWaitersUpToGeneration(itemId: string, generation: number, reason: unknown) {
    const list = this.waiters.get(itemId)
    if (!list || list.length === 0) return
    const remaining: typeof list = []
    for (const waiter of list) {
      if (waiter.generation <= generation) {
        try {
          waiter.reject(reason)
        } catch {}
      } else {
        remaining.push(waiter)
      }
    }
    if (remaining.length > 0) {
      this.waiters.set(itemId, remaining)
    } else {
      this.waiters.delete(itemId)
    }
  }
}
