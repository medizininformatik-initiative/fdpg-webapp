<template>
  <div v-if="participants" class="section">
    <h2 class="section-title">{{ t('proposal.participatingScientistsDetailTitle', { count: participantsCount }) }}</h2>
    <div class="participants">
      <div
        v-for="(people, panelType, index) in participants"
        :key="`panelType-${panelType}`"
        class="participant-item"
        :class="participantPanels[index] ? 'participant-item--expanded' : 'participant-item--collapsed'"
      >
        <div class="participant-item-header" @click="() => toggleParticipantPanel(index)">
          <h6><span /> {{ t(`proposal.${panelType}`) }} ({{ people.length }})</h6>
          <i
            :class="participantPanels[index] ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"
            type="button"
            tabindex="0"
            @keyup.enter="() => toggleParticipantPanel(index)"
          />
        </div>
        <div class="participant-item-content">
          <el-row
            v-for="(participant, participantIndex) in people"
            :key="`participant-${participantIndex}`"
            type="flex"
            align="middle"
          >
            <el-col :span="4">{{ participant.fullName }}</el-col>
            <el-col :span="4">
              <FdpgDropdown
                :button="{
                  label: t('proposal.participantCategory_' + participant.participantType),
                  kind: 'basic',
                  isTranslatable: false,
                }"
                :items="participantCategoryItems"
                :show-dropdown-icon="true"
              />
            </el-col>
            <el-col :span="4">
              <FdpgDropdown
                :button="{
                  label: t('roles.participantRole_' + participant.participantRole),
                  kind: 'basic',
                  isTranslatable: false,
                }"
                :items="[
                  {
                    label: 'roles.participantRole_PARTICIPATING_SCIENTIST',
                    kind: 'basic',
                    action: () => handleParticipantRoleSelect(participant, ParticipantRole.ParticipatingScientist),
                  },
                  {
                    label: 'roles.participantRole_RESEARCHER',
                    kind: 'basic',
                    action: () => handleParticipantRoleSelect(participant, ParticipantRole.Researcher),
                  },
                  {
                    label: 'roles.participantRole_RESPONSIBLE_SCIENTIST',
                    kind: 'basic',
                    action: () => handleParticipantRoleSelect(participant, ParticipantRole.ResponsibleScientist),
                  },
                ]"
                :show-dropdown-icon="true"
              />
            </el-col>
            <el-col :span="6">{{ participant.email }}</el-col>
            <el-col :span="6" class="action-column">
              <el-button
                v-if="participant.action && participant.actionTitle && participantPanels[index] && userHasPermission"
                v-loading="isEmailSendingInProgress"
                link
                :disabled="
                  participant.isDisabled || isEmailSendingInProgress || proposalStore.currentProposal?.isLocked
                "
                @click="participant.action"
              >
                {{ t(participant.actionTitle) }}
              </el-button>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeMount, ref } from 'vue'
import { useRoute } from 'vue-router'
import FdpgDropdown from './FdpgDropdown.vue'
import type { DropdownButton, DropdownItem } from '@/types/dropdown.types'
import { useI18n } from 'vue-i18n'

import useNotifications from '@/composables/use-notifications'
import type { TranslationSchema } from '@/plugins/i18n'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import { useUserStore } from '@/stores/user.store'
import type { IResearcherIdentity } from '@/types/proposal.types'
import { ParticipantType, ParticipantRole } from '@/types/proposal.types'
import { useAuthStore } from '@/stores/auth/auth.store'
import { Role } from '@/types/oidc.types'
import { Countries } from '@/types/location.enum'
import type { IParticipant } from '@/types/proposal.types'

const { params } = useRoute()
const proposalId = params.id as string

const proposalStore = useProposalStore()
const userStore = useUserStore()
const { showErrorMessage, showSuccessMessage } = useNotifications()
const { t } = useI18n()

interface ParticipantAction {
  action: () => Promise<void>
  actionTitle: TranslationSchema
}

interface ParticipantInfo extends Partial<ParticipantAction> {
  fullName: string
  participantType: ParticipantType
  email: string
  isDisabled?: boolean
  participantRole: ParticipantRole
}

type PanelType = 'invitationPending' | 'registrationPending' | 'alreadyRegistered'

type ParticipantPanelType = Record<PanelType, ParticipantInfo[]>

let researcherIdentities = ref<Omit<IResearcherIdentity, 'username'>[]>([])
const participantsCount = ref(0)
const triggeredEmails = ref<string[]>([])

const authStore = useAuthStore()
const userRole = computed<Role | undefined>(() => {
  return authStore.singleKnownRole
})
const userHasPermission = computed(() => {
  return userRole.value === Role.FdpgMember || userRole.value === Role.DataSourceMember
})
const getInvitationPendingAction = (identity: Omit<IResearcherIdentity, 'username'>): ParticipantAction => {
  return {
    action: () => createUser(identity),
    actionTitle: 'proposal.sendInvitation',
  }
}

const participantCategoryItems: DropdownItem[] = [
  {
    label: 'proposal.participantCategory_PROJECT_LEADER',
    kind: 'basic',
    action: () => handleParticipantTypeSelect(participant, ParticipantType.ProjectLeader),
  },
  {
    label: 'proposal.participantCategory_ADDITIONAL_PROJECT_LEADER',
    kind: 'basic',
    action: () => handleParticipantTypeSelect(participant, ParticipantType.AdditionalProjectLeader),
  },
  {
    label: 'proposal.participantCategory_DATA_RECEIVER',
    kind: 'basic',
    action: () => handleParticipantTypeSelect(participant, ParticipantType.DataReceiver),
  },
  {
    label: 'proposal.participantCategory_BIOSAMPLE_RECEIVER',
    kind: 'basic',
    action: () => handleParticipantTypeSelect(participant, ParticipantType.BiosampleReceiver),
  },
  {
    label: 'proposal.participantCategory_DATA_AND_BIOSAMPLE_RECEIVER',
    kind: 'basic',
    action: () => handleParticipantTypeSelect(participant, ParticipantType.DataAndBiosampleReceiver),
  },
]

const getRegistrationPendingAction = (
  identity: Pick<IResearcherIdentity | ParticipantInfo, 'email'>,
): ParticipantAction => {
  return {
    action: () => resendInvitation(identity),
    actionTitle: 'proposal.resendInvitation',
  }
}
const participants = computed<ParticipantPanelType>(() => {
  return researcherIdentities.value.reduce(
    (acc, info) => {
      const result = {
        fullName: `${info.firstName} ${info.lastName}`,
        participantType: info.participantType,
        participantRole: info.participantRole as ParticipantRole,
        email: info.email,
        isDisabled: triggeredEmails.value.includes(info.email),
      }
      if (info.isRegistrationComplete) {
        acc.alreadyRegistered.push(result)
      } else if (info.isExisting) {
        acc.registrationPending.push({
          ...result,
          ...getRegistrationPendingAction(info),
        })
      } else {
        acc.invitationPending.push({
          ...result,
          ...getInvitationPendingAction(info),
        })
      }
      return acc
    },
    {
      invitationPending: [],
      registrationPending: [],
      alreadyRegistered: [],
    } as ParticipantPanelType,
  )
})

onBeforeMount(async () => {
  try {
    researcherIdentities.value = await proposalStore.getResearcherInfo(proposalId)
    participantsCount.value = researcherIdentities.value.length
  } catch (error) {
    console.log(error)
  }
})

const participantPanels = ref<boolean[]>([])

const toggleParticipantPanel = (id: number) => {
  participantPanels.value[id] = !participantPanels.value[id]
}

const isEmailSendingInProgress = ref(false)
const createUser = async (userToCreate: Omit<IResearcherIdentity, 'username'>) => {
  const users = researcherIdentities.value.filter((identity) => identity.email === userToCreate.email)
  if (users.length) {
    isEmailSendingInProgress.value = true
    try {
      const userToCreate = {
        ...users[0],
        username: users[0].email,
      }
      await userStore.create(userToCreate)
      triggeredEmails.value.push(userToCreate.email)
      users.forEach((user) => (user.isExisting = true))
      showSuccessMessage()
    } catch (error) {
      showErrorMessage()
    }
    isEmailSendingInProgress.value = false
  }
}

const resendInvitation = async (user: Pick<IResearcherIdentity | ParticipantInfo, 'email'>) => {
  isEmailSendingInProgress.value = true
  try {
    await userStore.resendInvitation(user.email)
    triggeredEmails.value.push(user.email)
    showSuccessMessage()
  } catch (error) {
    showErrorMessage()
  }
  isEmailSendingInProgress.value = false
}

async function handleParticipantTypeSelect(participant: ParticipantInfo, newType: ParticipantType) {
  try {
    participant.participantType = newType
    const researcher = researcherIdentities.value.find((r) => r.email === participant.email)
    if (researcher) {
      researcher.participantType = newType
    }
    const updatedParticipants: IParticipant[] =
      proposalStore.currentProposal?.participants?.map((p) => {
        if (p.researcher.email === participant.email) {
          return {
            ...p,
            participantCategory: {
              ...p.participantCategory,
              category: newType,
            },
          }
        }
        return p
      }) ?? []
    await proposalStore.updateParticipants(proposalId, updatedParticipants)
    showSuccessMessage()
  } catch (error) {
    console.error('Error updating participant type:', error)
    showErrorMessage()
  }
}

async function handleParticipantRoleSelect(participant: ParticipantInfo, newRole: ParticipantRole) {
  try {
    participant.participantRole = newRole
    const researcher = researcherIdentities.value.find((r) => r.email === participant.email)
    if (researcher) {
      researcher.participantRole = newRole
    }
    const updatedParticipants: IParticipant[] =
      proposalStore.currentProposal?.participants?.map((p) => {
        if (p.researcher.email === participant.email) {
          return {
            ...p,
            participantRole: {
              ...p.participantRole,
              role: newRole,
            },
          }
        }
        return p
      }) ?? []
    await proposalStore.updateParticipants(proposalId, updatedParticipants)
    showSuccessMessage()
  } catch (error) {
    console.error('Error updating participant role:', error)
    showErrorMessage()
  }
}
</script>

<style lang="scss">
@use '@/assets/sass/variable' as *;

.participants {
  border-radius: 4px;
  border: 1px solid $gray-700;

  .participant-item {
    border-bottom: 1px solid $gray-700;

    &.participant-item--expanded {
      .participant-item-content {
        height: 100%;
        opacity: 1;
        transition-duration: 100ms;
        transition-timing-function: linear;
        overflow: visible;

        .el-col {
          position: static;
        }
      }
    }

    &.participant-item--collapsed {
      .participant-item-content {
        max-height: 0;
        opacity: 0;
        overflow: hidden;
        padding-top: 0;
        padding-bottom: 0;
      }
    }

    &:nth-child(1) {
      .participant-item-header {
        h6 {
          span {
            background-color: $gray-800;
          }
        }
      }

      .participant-item-content {
        .el-tag {
          background-color: $gray-800;
        }
      }
    }

    &:nth-child(2) {
      .participant-item-header {
        h6 {
          span {
            background-color: $blue;
          }
        }
      }

      .participant-item-content {
        .el-tag {
          background-color: $blue;
        }
      }
    }

    &:nth-child(3) {
      .participant-item-header {
        h6 {
          span {
            background-color: $green;
          }
        }
      }

      .participant-item-content {
        .el-tag {
          background-color: $green;
        }
      }
    }

    &:last-child {
      border-bottom: none;
    }

    .participant-item-header {
      display: flex;
      position: relative;
      align-items: center;
      padding: 7px 25px 8px 7px;
      cursor: pointer;

      h6 {
        color: $black;
        font-weight: 600;
        margin: 0;
        font-size: 16px;
        display: flex;
        align-items: center;

        span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
          margin-right: 7px;
        }
      }

      & > i {
        right: 11px;
        position: absolute;
      }
    }

    .participant-item-content {
      color: $black;
      padding: 10px 39px 9px 39px;
      transition: all 0.3s ease;

      .el-row {
        padding: 13px 0;

        &:not(:last-child) {
          border-bottom: 1px solid $gray-200;
        }
      }

      .el-tag {
        border: none;
        color: $white;
        padding: 0 14px;
        font-size: 14px;

        & ~ .el-tag {
          margin-left: 4px;
        }
      }

      .action-column {
        display: flex;
        justify-content: flex-end;
      }

      .el-button {
        font-weight: 600;
        font-size: 16px;
        min-height: 24px;
        height: 24px;

        &:hover:not(:disabled) {
          background-color: $gray-100;
          color: $blue;
        }
      }
    }
  }
}

:deep(.menu) {
  position: relative;
  z-index: 100;

  .menu-items {
    max-height: 200px;
    overflow-y: auto;
    z-index: 101;
  }
}
</style>
