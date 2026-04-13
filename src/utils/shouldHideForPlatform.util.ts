import type { PlatformIdentifier } from '@/types/platform-identifier.enum'

export const shouldHideForPlatform = (
  assignedDataSources: PlatformIdentifier[],
  platform: PlatformIdentifier,
  selectedDataSources: PlatformIdentifier[],
): boolean => {
  return !((assignedDataSources || []).includes(platform) || (selectedDataSources || []).includes(platform))
}
