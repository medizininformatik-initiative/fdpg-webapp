<template>
  <PanelTodoStatus
    :icon-class="stateMap[proposal.locationState].icon"
    :style-class="stateMap[proposal.locationState].styleClass"
    :message="stateMap[proposal.locationState].message"
  />
</template>

<script setup lang="ts">
import type { TranslationSchema } from '@/plugins/i18n'
import type { IProposalDetail} from '@/types/proposal.types';
import { LocationState } from '@/types/proposal.types'
import type { PropType } from 'vue'
import PanelTodoStatus from './PanelTodoStatus.vue'

defineProps({
  proposal: {
    type: Object as PropType<IProposalDetail>,
    required: true,
  },
})

interface ILocationState {
  message: TranslationSchema
  icon: string
  styleClass: string
}

const stateMap: Record<LocationState, ILocationState> = {
  [LocationState.IsDizCheck]: {
    message: `locationStatus.${LocationState.IsDizCheck}`,
    icon: 'fa-solid fa-list-check',
    styleClass: 'active',
  },
  [LocationState.DizApproved]: {
    message: `locationStatus.${LocationState.DizApproved}`,
    icon: 'fa-solid fa-list-check',
    styleClass: 'active',
  },
  [LocationState.UacApproved]: {
    message: `locationStatus.${LocationState.UacApproved}`,
    icon: 'fa-solid fa-hourglass-start',
    styleClass: 'pending',
  },
  [LocationState.SignedContract]: {
    message: `locationStatus.${LocationState.SignedContract}`,
    icon: 'fa-solid fa-hourglass-start',
    styleClass: 'pending',
  },
  [LocationState.SignedContractAndContractingDone]: {
    message: `locationStatus.${LocationState.SignedContractAndContractingDone}`,
    icon: 'fa-solid fa-circle-check',
    styleClass: 'success',
  },
  [LocationState.RequestedButExcluded]: {
    message: `locationStatus.${LocationState.RequestedButExcluded}`,
    icon: 'fa-solid fa-ban',
    styleClass: 'danger',
  },
  [LocationState.NotRequested]: {
    message: `locationStatus.${LocationState.NotRequested}`,
    icon: 'fa-solid fa-ban',
    styleClass: 'pending',
  },
  [LocationState.ConditionalApprovalDeclined]: {
    message: `locationStatus.${LocationState.ConditionalApprovalDeclined}`,
    icon: 'fa-solid fa-ban',
    styleClass: 'danger',
  },
  [LocationState.ResearcherRejectedContract]: {
    message: `locationStatus.${LocationState.ResearcherRejectedContract}`,
    icon: 'fa-solid fa-ban',
    styleClass: 'danger',
  },
  [LocationState.ResearcherAcceptedContract]: {
    message: `locationStatus.${LocationState.ResearcherAcceptedContract}`,
    icon: 'fa-solid fa-file-signature',
    styleClass: 'active',
  },
  [LocationState.ConditionalApprovalAccepted]: {
    message: `locationStatus.${LocationState.ConditionalApprovalAccepted}`,
    icon: 'fa-solid fa-hourglass-start',
    styleClass: 'pending',
  },
  [LocationState.ConditionalApprovalPending]: {
    message: `locationStatus.${LocationState.ConditionalApprovalPending}`,
    icon: 'fa-solid fa-hourglass-start',
    styleClass: 'pending',
  },
}
</script>
