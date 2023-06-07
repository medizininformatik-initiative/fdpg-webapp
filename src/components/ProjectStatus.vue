<template>
  <div v-if="projectStatus" class="section">
    <h2 class="section-title">
      {{ $t('proposal.projectStatus') }}
    </h2>
    <div :class="`project-status ${projectStatus.type}`">
      <div class="steps">
        <div
          v-for="step of 6"
          :key="`step-${step}`"
          class="step"
          :class="{ active: step <= stepMap[proposalStatus ?? 'default'] }"
        />
      </div>
      <div class="description">
        {{ $t(projectStatus.description, { ...projectStatus.descriptionI18nParameter }) }}
        <section
          v-if="proposalStore.currentProposal?.contractRejectedByResearcherReason"
          role="region"
          class="declineReason"
        >
          <p>{{ $t('proposal.contractRejectedByResearcherReasonTitle') }}:</p>
          <p>
            {{ proposalStore.currentProposal?.contractRejectedByResearcherReason }}
          </p>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth/auth.store'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import { Role } from '@/types/oidc.types'
import type { IProjectStatus } from '@/types/project-status'
import type { IProposal} from '@/types/proposal.types';
import { ProposalStatus } from '@/types/proposal.types'
import type { PropType} from 'vue';
import { computed, onBeforeUnmount, ref, watch } from 'vue'

defineProps({
  proposalStatus: {
    type: String as PropType<ProposalStatus>,
    required: true,
  },
})

const stepMap: Record<ProposalStatus | 'default', number> = {
  default: 0,
  [ProposalStatus.Draft]: 0,
  [ProposalStatus.FdpgCheck]: 1,
  [ProposalStatus.Rework]: 1,
  [ProposalStatus.LocationCheck]: 2,
  [ProposalStatus.Contracting]: 3,
  [ProposalStatus.ExpectDataDelivery]: 4,
  [ProposalStatus.DataCorrupt]: 4,
  [ProposalStatus.DataResearch]: 5,
  [ProposalStatus.FinishedProject]: 6,
  [ProposalStatus.Rejected]: 6,
  [ProposalStatus.Archived]: 6,
  [ProposalStatus.ReadyToArchive]: 6,
}
const proposalStore = useProposalStore()
const authStore = useAuthStore()

const projectStatus = ref<IProjectStatus>()
let handler: { getProjectStatus: (proposal: IProposal) => IProjectStatus }

const setStatusForRole = async () => {
  switch (authStore.singleKnownRole) {
    case Role.Researcher:
      handler = await import('../utils/project-status-handling/project-status-researcher')
      break
    case Role.FdpgMember:
      handler = await import('../utils/project-status-handling/project-status-fdpg')
      break
    case Role.DizMember:
      handler = await import('../utils/project-status-handling/project-status-diz')
      break
    case Role.UacMember:
      handler = await import('../utils/project-status-handling/project-status-uac')
      break

    default:
      handler = await import('../utils/project-status-handling/project-status-researcher')
      break
  }

  if (proposalStore.currentProposal) {
    projectStatus.value = handler.getProjectStatus(proposalStore.currentProposal)
  }
}

const currentProposal = computed(() => proposalStore.currentProposal)
watch(
  currentProposal,
  async () => {
    if (proposalStore.currentProposal?._id) {
      await setStatusForRole()
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  projectStatus.value = undefined
})
</script>

<style lang="scss">
@import 'src/assets/sass/variable';
.project-status {
  display: flex;
  border-radius: 4px;
  flex-direction: column;
  background-color: $gray-100;

  &.info {
    color: $blue;
    background-color: $gray-100;

    .steps {
      .step {
        &.active {
          background-color: $blue;
        }
      }
    }
  }

  &.success {
    color: $green;
    background-color: lighten($green, 50%);

    .steps {
      .step {
        &.active {
          background-color: $green;
        }
      }
    }
  }

  &.warning {
    color: $red-100;
    background-color: lighten($red-100, 47%);

    .steps {
      .step {
        &.active {
          background-color: $red-100;
        }
      }
    }
  }

  // Neutral
  .steps {
    display: flex;

    .step {
      flex: 1;
      height: 8px;
      margin-right: 4px;
      background-color: $gray-700;

      &:first-child {
        border-top-left-radius: 4px;
      }

      &:last-child {
        margin-right: 0;
        border-top-right-radius: 4px;
      }
    }
  }

  .description {
    display: flex;
    flex-direction: column;
    flex: 1;
    font-weight: 500;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }

  .declineReason {
    width: 100%;
  }
}
</style>
