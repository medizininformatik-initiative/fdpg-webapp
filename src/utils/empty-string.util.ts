export const transformEmptyStringToUndefined = (value?: string | Date): string | undefined => {
  if (value) {
    let trimmed: string

    if (typeof (value as Date).toISOString === 'function') {
      trimmed = (value as Date).toISOString()
    } else {
      trimmed = (value as string).trim()
    }
    return trimmed.length > 0 ? trimmed : undefined
  }

  return undefined
}

export const hasNoContent = (value?: { _id?: string; isDone?: boolean }): boolean => {
  if (!value) {
    return true
  }

  const existingValues = Object.entries(value).filter((entry) => {
    return (
      entry[1] !== null /** if the value is not existing */ &&
      entry[1] !== undefined /** if the value is not existing */ &&
      entry[0] !== '_id' /** if the key is not a helper */ &&
      entry[0] !== 'isDone' /** if the value is not a helper */
    )
  })

  return existingValues.length <= 0
}
