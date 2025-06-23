import type { PlatformIdentifier } from '@/types/platform-identifier.enum'

export const shouldHideForPlatform = (dataSources: PlatformIdentifier[], platform: PlatformIdentifier): boolean => {
  return !dataSources.includes(platform) && !!dataSources.length
}
