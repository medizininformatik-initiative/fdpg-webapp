import { getDateDiff, getLocaleDateString } from '@/utils/date.util'

describe('date util', () => {
  describe('getDateDiff', () => {
    it('should return the difference between two dates', () => {
      const date = new Date()
      expect(getDateDiff(date.toISOString())).toBe(-7)
    })
  })

  describe('getLocaleDateString', () => {
    it('should return a formatted date string', () => {
      const date = new Date()
      expect(getLocaleDateString(date.toISOString())).toBe(
        date.toLocaleDateString('de-DE', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }),
      )
    })

    it('should return an empty string if no date is given', () => {
      expect(getLocaleDateString()).toBe('')
    })
  })
})
