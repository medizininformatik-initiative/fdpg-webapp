export class SimpleQueue {
  private tasks: (() => Promise<any>)[] = []
  private isRunning = false

  async add<T>(promiseFunction: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.tasks.push(async () => {
        try {
          const result = await promiseFunction()
          resolve(result)
        } catch (error) {
          reject(error)
        }
      })

      this.run()
    })
  }

  private async run() {
    if (this.isRunning || this.tasks.length === 0) return

    this.isRunning = true

    while (this.tasks.length > 0) {
      const task = this.tasks.shift()!
      await task()
    }

    this.isRunning = false
  }

  clear() {
    this.tasks = []
  }

  get pending() {
    return this.tasks.length
  }
}

export class UpdateQueue<T = any> {
  private queue = new SimpleQueue()
  private latestItems = new Map<string, T>()
  private processing = false

  async update(item: T, updateFunction: (item: T) => Promise<any>): Promise<any> {
    const itemId = this.getId(item)

    // Store the latest version of this item
    this.latestItems.set(itemId, item)

    // Always trigger processing (this was the bug - it should always try to process)
    return this.processUpdates(updateFunction)
  }

  private async processUpdates(updateFunction: (item: T) => Promise<any>): Promise<any> {
    // If already processing, just return - the current processing will handle new items
    if (this.processing) {
      return Promise.resolve()
    }

    this.processing = true

    try {
      while (this.latestItems.size > 0) {
        // Get all current items to process
        const itemsToProcess = Array.from(this.latestItems.entries())
        this.latestItems.clear()

        // Process each item sequentially
        for (const [itemId, item] of itemsToProcess) {
          try {
            await this.queue.add(() => updateFunction(item))
          } catch (error) {}
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
  }

  get pending() {
    return this.latestItems.size + this.queue.pending
  }
}
