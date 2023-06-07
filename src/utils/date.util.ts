export const getDateDiff = (date: string, subtractDays = 7) => {
  // TODO: Check if everything works with timezones
  const prevDate = new Date(new Date(date).toDateString()).getTime()
  const currentDate = new Date(new Date().toDateString()).getTime()
  const diffTime = prevDate - currentDate
  return Math.floor(diffTime / (1000 * 60 * 60 * 24)) - subtractDays
}

export const getLocaleDateString = (value?: string | Date, locale: string = 'de-DE') => {
  if (!value) {
    return ''
  }

  const valueAsDate = value instanceof Date ? value : new Date(value)

  return valueAsDate.toLocaleDateString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}
