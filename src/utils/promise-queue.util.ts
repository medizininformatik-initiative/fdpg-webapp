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
  private latestItems = new Map<string, T>()
  private processing = false
  private latestUpdateFunction: ((item: T) => Promise<any>) | null = null

  async update(item: T, updateFunction: (item: T) => Promise<any>): Promise<any> {
    const itemId = this.getId(item)

    // Store the latest version of this item
    this.latestItems.set(itemId, item)

    // Store the latest update function
    this.latestUpdateFunction = updateFunction

    // Always trigger processing
    return this.processUpdates()
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
          for (const [itemId, item] of itemsToProcess) {
            try {
              await this.queue.add(() => currentUpdateFunction(item))
            } catch (error) {
              // Silently ignore errors to prevent one item from stopping others
            }
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
    this.latestItems.clear()
    this.queue.clear()
    this.processing = false
    this.latestUpdateFunction = null
  }

  get pending() {
    return this.latestItems.size + this.queue.size
  }
}
