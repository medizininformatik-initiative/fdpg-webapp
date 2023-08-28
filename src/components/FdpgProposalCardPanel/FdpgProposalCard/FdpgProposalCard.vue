<template>
  <div
    class="fdpg-card"
    @click="openDetails"
    @keyup.enter="openDetails"
    @keydown.prevent.self.space="focusFirstActionItem($event)"
    @keydown.prevent.esc="focusCard($event)"
    @focus="handleFocus($event)"
  >
    <div class="header" :class="{ warn: proposal.computedDueDate !== undefined && proposal.computedDueDate < 0 }">
      <h5 class="title">
        {{ proposal.projectAbbreviation }}
      </h5>
      <span
        v-if="type === CardType.Draft"
        ref="actionsRef"
        class="actions"
        @keydown.right="focusNextButton($event)"
        @keydown.left="focusPreviousButton($event)"
        @focus="handleFocus($event)"
      >
        <span
          class="action-item"
          role="button"
          @click="duplicateProposal"
          @keyup.enter="duplicateProposal"
          @focus="handleFocus($event)"
        >
          <span class="icon fa-regular fa-copy" />
        </span>
        <span
          class="action-item"
          role="button"
          @click="handleDeleteProposalModal"
          @keyup.enter="handleDeleteProposalModal"
          @focus="handleFocus($event)"
        >
          <span class="fa fa-trash" aria-hidden="true" />
        </span>
      </span>
      <span v-else class="due-date">
        <template v-if="proposal.computedDueDate !== undefined && proposal.computedDueDate >= 0">{{
          $t('dashboard.xDaysLeft', { x: proposal.computedDueDate })
        }}</template>
        <template v-else-if="proposal.computedDueDate !== undefined && proposal.computedDueDate < 0">{{
          $t('dashboard.xDaysOverdue', { x: -proposal.computedDueDate })
        }}</template>
      </span>
    </div>
    <div class="content">
      <p v-if="proposal.projectTitle && !showLocationVoting" class="description">
        {{ proposal.projectTitle }}
      </p>
      <p class="applicant">
        {{ $t('general.applicant') }}: <span>{{ proposal.ownerName }}</span>
      </p>
      <PanelLockedStatus v-if="showLockedStatus" />
      <template v-else>
        <PanelLocationVote v-if="showLocationVoting && proposal" :proposal="proposal" />
        <PanelLocationStatus v-if="proposal?.locationState" :proposal="proposal" />
        <PanelResearcherStatus v-if="showResearcherStatus" :proposal="proposal" />
      </template>

      <div class="footer">
        <template v-if="type === CardType.Draft">
          <span class="updated-at">
            {{ $t('dashboard.editedXDaysAgo', { x: editedAgo }) }}
          </span>
        </template>
        <template v-else>
          <span v-if="proposal.submittedAt" class="submitted-at">
            {{ $t('dashboard.applicationSubmittedXDaysAgo', { x: submittedAgo }) }}
          </span>
          <div v-if="notifications" class="information">
            <span
              v-for="(count, notificationType, idx) in notifications"
              :key="'notification_' + idx"
              class="information-item"
            >
              <span class="icon" :class="notificationIcon[notificationType]" aria-hidden="true" />
              <span class="count">{{ count }}</span>
            </span>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import useCardPanelAccessibility from '@/composables/use-card-panel-accessibility'
import { useAuthStore } from '@/stores/auth/auth.store'
import { useMessageBoxStore, type DecisionType } from '@/stores/messageBox.store'
import { CardType } from '@/types/component.types'
import { Role } from '@/types/oidc.types'
import type { IProposalDetail } from '@/types/proposal.types'
import { FdpgTaskType, ProposalStatus } from '@/types/proposal.types'
import { RouteName } from '@/types/route-name.enum'
import { getDateDiff } from '@/utils/date.util'
import type { PropType } from 'vue'
import { computed, defineAsyncComponent, ref } from 'vue'
import { useRouter } from 'vue-router'

const messageBoxStore = useMessageBoxStore()

const PanelLocationVote = defineAsyncComponent(() => import('../PanelLocationVote/PanelLocationVote.vue'))
const PanelLocationStatus = defineAsyncComponent(() => import('../PanelTodoStatus/PanelLocationStatus.vue'))
const PanelResearcherStatus = defineAsyncComponent(() => import('../PanelTodoStatus/PanelResearcherStatus.vue'))
const PanelLockedStatus = defineAsyncComponent(() => import('../PanelTodoStatus/PanelLockedStatus.vue'))

const router = useRouter()

const props = defineProps({
  proposal: {
    type: Object as PropType<IProposalDetail>,
    required: true,
  },
  type: {
    type: String as PropType<CardType>,
    required: true,
  },
})

const emits = defineEmits(['delete', 'duplicate'])

const submittedAgo = computed(() => Math.abs(getDateDiff(props.proposal.submittedAt, 0)))
const editedAgo = computed(() => Math.abs(getDateDiff(props.proposal.updatedAt, 0)))

const authStore = useAuthStore()
const showLocationVoting = computed(() => {
  return props.proposal.status === ProposalStatus.LocationCheck && authStore.singleKnownRole === Role.FdpgMember
})
const showResearcherStatus = computed(() => {
  return authStore.singleKnownRole === Role.Researcher
})
const showLockedStatus = computed(() => {
  return props.proposal.isLocked
})
const notificationIcon = {
  [FdpgTaskType.Comment]: 'bi bi-chat-right-text',
  [FdpgTaskType.ConditionApproval]: 'bi bi-file-earmark',
}
const notifications = computed(() => {
  if (authStore.singleKnownRole === Role.FdpgMember) {
    return props.proposal.openFdpgTasks.reduce((acc, task) => {
      if (task.type === FdpgTaskType.Comment || task.type === FdpgTaskType.ConditionApproval) {
        acc[task.type] = (acc[task.type] ?? 0) + 1
      }
      return acc
    }, {} as Record<FdpgTaskType, number>)
  } else {
    return undefined
  }
})

const actionsRef = ref()

const openDetails = (e: Event) => {
  if (actionsRef.value?.contains(e.target)) {
    return
  }
  router.push({
    name: RouteName.ProposalDetails,
    params: { id: props.proposal._id },
  })
}

const handleDeleteProposalModal = () => {
  messageBoxStore.setMessageBoxInfo({
    cancelButtonText: 'general.cancel',
    cancelButtonClass: 'el-button--text',
    showCancelButton: true,
    title: 'proposal.deleteProposalModalTitle',
    message: 'proposal.deleteProposalModalDescription',
    confirmButtonText: 'proposal.acceptContractDizModalAction',
    callback: async(decision: DecisionType) => (decision === 'confirm' ? deleteProposal() : undefined),
  })
}

const { handleFocus, focusCard, focusFirstActionItem, focusPreviousButton, focusNextButton } =
  useCardPanelAccessibility()

const duplicateProposal = () => {
  emits('duplicate')
}

const deleteProposal = () => {
  emits('delete')
}
</script>

<style lang="scss" scoped>
@import 'src/assets/sass/variable';

.fdpg-card {
  border-radius: 4px;
  padding: 20px 20px 25px;
  background-color: $white;
  box-shadow: 0 0 10px 0 $gray-600;
  cursor: pointer;

  &:hover {
    transition-duration: 0.5s;
    box-shadow: 0 10px 15px $gray-800;

    .header {
      .actions {
        visibility: visible;
      }
    }
  }

  &:focus {
    .header {
      .actions {
        visibility: visible;
        &:focus {
          outline: $blue auto 1px;
          outline-offset: 3px;
        }
      }
    }
  }

  .header {
    display: flex;
    justify-content: space-between;
    position: relative;

    .actions {
      .action-item {
        cursor: pointer;

        &:first-of-type {
          margin-right: 8px;
        }
      }
    }

    &.warn {
      .title {
        background-color: $red-100;
      }

      .due-date {
        color: $red-100;
      }
    }

    .title {
      margin: 0;
      color: $white;
      font-size: 12px;
      padding: 0 12px;
      font-weight: 400;
      line-height: 20px;
      border-radius: 5px;
      background-color: $blue;
    }

    .due-date {
      font-size: 14px;
    }
  }

  .content {
    padding-top: 17px;

    .description {
      margin-top: 0;
      margin-bottom: 10px;
      color: $black;
      font-size: 18px;
      font-weight: 600;
      max-height: 5em;
      line-height: 1em;
      overflow: hidden;
    }

    .applicant {
      margin: 0;

      span {
        font-weight: 600;
      }
    }

    .footer {
      padding-top: 9px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .submitted-at {
        margin: 0;
        font-size: 12px;
        font-weight: 400;
      }

      .updated-at {
        margin: 0;
        font-size: 12px;
        font-weight: 400;
      }

      .information {
        .information-item {
          & ~ .information-item {
            margin-left: 8px;
          }

          .icon {
            font-size: 18px;
          }

          .count {
            font-size: 16px;
            font-weight: 600;
            padding: 0 0.2rem;
          }
        }
      }
    }
  }
}

.fdpg-card-action-popover {
  bottom: -10px;
  font-weight: 600;
  width: unset !important;
  color: $white !important;
  font-size: 12px !important;
  min-width: unset !important;
  padding: 1px 11px !important;
  border-radius: 5px !important;
  background-color: $gray-900 !important;
}
</style>
