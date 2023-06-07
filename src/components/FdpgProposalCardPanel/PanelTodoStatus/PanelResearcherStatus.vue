<template>
  <PanelTodoStatus :icon-class="status.icon" :style-class="status.styleClass" :message="status.message" />
</template>

<script setup lang="ts">
import type { TranslationSchema } from '@/plugins/i18n'
import type { IProposalDetail} from '@/types/proposal.types';
import { ProposalStatus } from '@/types/proposal.types'
import type { PropType } from 'vue';
import { computed } from 'vue'
import PanelTodoStatus from './PanelTodoStatus.vue'

const props = defineProps({
  proposal: {
    type: Object as PropType<IProposalDetail>,
    required: true,
  },
})

interface IResearcherState {
  message: TranslationSchema
  icon: string
  styleClass: string
}

const status = computed<IResearcherState>(() => {
  switch (props.proposal.status) {
    case ProposalStatus.Draft:
    default:
      return {
        message: 'researcherStatus.DRAFT',
        icon: 'fa-solid fa-paper-plane',
        styleClass: 'active',
      }
    case ProposalStatus.Rejected:
      if (props.proposal.contractRejectedByResearcher) {
        return {
          message: 'researcherStatus.RESEARCHER_REJECTED_CONTRACT',
          icon: 'fa-solid fa-ban',
          styleClass: 'danger',
        }
      } else {
        return {
          message: 'researcherStatus.REJECTED',
          icon: 'fa-solid fa-ban',
          styleClass: 'danger',
        }
      }
    case ProposalStatus.Archived:
      return {
        message: 'researcherStatus.ARCHIVED',
        icon: 'fa-solid fa-box-archive',
        styleClass: 'pending',
      }
    case ProposalStatus.Rework:
      return {
        message: 'researcherStatus.REWORK',
        icon: 'fa-solid fa-list-check',
        styleClass: 'danger',
      }
    case ProposalStatus.FdpgCheck:
      return {
        message: 'researcherStatus.FDPG_CHECK',
        icon: 'fa-solid fa-list-check',
        styleClass: 'pending',
      }
    case ProposalStatus.LocationCheck:
      return {
        message: 'researcherStatus.LOCATION_CHECK',
        icon: 'fa-solid fa-list-check',
        styleClass: 'pending',
      }
    case ProposalStatus.Contracting:
      if (props.proposal.contractAcceptedByResearcher) {
        return {
          message: 'researcherStatus.LOCATION_CONTRACTING',
          icon: 'fa-solid fa-file-signature',
          styleClass: 'pending',
        }
      } else {
        return {
          message: 'researcherStatus.RESEARCHER_CONTRACTING',
          icon: 'fa-solid fa-file-signature',
          styleClass: 'active',
        }
      }
    case ProposalStatus.ExpectDataDelivery:
      return {
        message: 'researcherStatus.EXPECT_DATA_DELIVERY',
        icon: 'fa-solid fa-database',
        styleClass: 'active',
      }
    case ProposalStatus.DataResearch:
      return {
        message: 'researcherStatus.DATA_RESEARCH',
        icon: 'fa-solid fa-list-check',
        styleClass: 'active',
      }
    case ProposalStatus.DataCorrupt:
      return {
        message: 'researcherStatus.DATA_CORRUPT',
        icon: 'fa-solid fa-circle-exclamation',
        styleClass: 'danger',
      }
    case ProposalStatus.FinishedProject:
      return {
        message: 'researcherStatus.FINISHED_PROJECT',
        icon: 'fa-solid fa-circle-check',
        styleClass: 'active',
      }
    case ProposalStatus.ReadyToArchive:
      return {
        message: 'researcherStatus.READY_TO_ARCHIVE',
        icon: 'fa-solid fa-box-archive',
        styleClass: 'active',
      }
  }
})
</script>
