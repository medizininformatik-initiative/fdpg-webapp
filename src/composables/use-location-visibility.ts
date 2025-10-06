import type { IAnswerDetail, ICommentDetail, ICommentOwner } from '@/types/comment.interface'
import { CommentType } from '@/types/comment.interface'
import type { ILocation } from '@/types/location.types'
import type { ComputedRef } from 'vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
export interface IVisibilityMessage {
  locations: string[]
  owner: ICommentOwner
}

export default (
  message: ComputedRef<IVisibilityMessage | ICommentDetail | IAnswerDetail>,
  type: CommentType,
  showSingleLocationName: boolean,
  possibleLocations: ILocation[],
) => {
  const { t } = useI18n()
  const visibility = computed<string | undefined>(() => {
    if (message.value.locations === undefined || type === CommentType.PROPOSAL_MESSAGE_TO_OWNER) {
      return undefined
    } else if ((message.value.locations?.length ?? -1) === possibleLocations.length) {
      return t('proposal.commentVisibleForAll')
    } else if (message.value.locations.length === 0) {
      return t('proposal.commentVisibleForNoLocation')
    } else if (message.value.locations?.length > 1) {
      return t('proposal.commentVisibleForCount', { count: message.value.locations?.length })
    } else if (message.value.owner.miiLocation === message.value.locations[0]) {
      return t('proposal.commentVisibleForThisLocation')
    } else if (showSingleLocationName) {
      const location = possibleLocations.filter((loc) => message.value.locations?.includes(loc._id))?.[0]?.display
      return t('proposal.commentVisibleForOneOtherLocation', { location })
    } else {
      return t('proposal.commentVisibleForOneLocation')
    }
  })
  return {
    visibility,
  }
}
