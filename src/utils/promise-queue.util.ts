interface QueueItem<T> {
  task: () => Promise<T>
  resolve: (value: T) => void
  reject: (reason?: any) => void
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
  private latestItems = new Map<
    string,
    {
      item: T
      updateFunction: (item: T) => Promise<any>
      promises: { resolve: (value: any) => void; reject: (reason?: any) => void }[]
    }
  >()
  private processing = false

  async update(item: T, updateFunction: (item: T) => Promise<any>): Promise<any> {
    const itemId = this.getId(item)

    return new Promise((resolve, reject) => {
      // Get existing entry or create new one
      const existing = this.latestItems.get(itemId)

      if (existing) {
        // Update the item and function, add this promise to the list
        existing.item = item
        existing.updateFunction = updateFunction
        existing.promises.push({ resolve, reject })
      } else {
        // Create new entry
        this.latestItems.set(itemId, {
          item,
          updateFunction,
          promises: [{ resolve, reject }],
        })
      }

      // Always trigger processing
      this.processUpdates()
    })
  }

  private async processUpdates(): Promise<void> {
    // If already processing, just return - the current processing will handle new items
    if (this.processing) {
      return
    }

    this.processing = true

    try {
      while (this.latestItems.size > 0) {
        // Get all current items to process
        const itemsToProcess = Array.from(this.latestItems.entries())
        this.latestItems.clear()

        // Process each item sequentially
        for (const [itemId, { item, updateFunction, promises }] of itemsToProcess) {
          try {
            const result = await this.queue.add(() => updateFunction(item))
            // Resolve all promises for this item
            promises.forEach(({ resolve }) => resolve(result))
          } catch (error) {
            // Reject all promises for this item
            promises.forEach(({ reject }) => reject(error))
          }
        }
      }
    } finally {
      this.processing = false
    }
  }

  private getId(item: any): string {
    return item.id || item._id || JSON.stringify(item)
  }

  clear() {
    // Reject all pending promises
    for (const [, { promises }] of this.latestItems) {
      promises.forEach(({ reject }) => reject(new Error('Queue cleared')))
    }

    this.latestItems.clear()
    this.queue.clear()
    this.processing = false
  }

  get pending() {
    return this.latestItems.size + this.queue.size
  }
}
