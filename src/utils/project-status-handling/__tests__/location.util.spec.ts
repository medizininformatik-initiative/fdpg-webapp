import { LocationUtil } from '@/utils/location.util'

describe('location util', () => {
  const locationUtil = new LocationUtil()

  it('should return the location', () => {
    expect(locationUtil.location).toBe(window.location)
  })

  it('should return the protocol', () => {
    expect(locationUtil.protocol).toBe(window.location.protocol)
  })

  it('should return the host', () => {
    expect(locationUtil.host).toBe(window.location.host)
  })

  it('should return the base path', () => {
    expect(locationUtil.basePath).toBe(import.meta.env.VITE_BASE_PATH)
  })

  it('should return the base url', () => {
    expect(locationUtil.baseUrl).toBe(
      `${window.location.protocol}//${window.location.host}${
        import.meta.env.VITE_BASE_PATH ? import.meta.env.VITE_BASE_PATH : '/'
      }${import.meta.env.VITE_BASE_URL ? import.meta.env.VITE_BASE_URL : ''}`,
    )
  })
})
