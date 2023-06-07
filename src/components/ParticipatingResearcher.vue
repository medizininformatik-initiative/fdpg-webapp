<template>
  <div v-if="participants" class="section">
    <h2 class="section-title">{{ $t('proposal.participatingScientistsDetailTitle', { count: participantsCount }) }}</h2>
    <div class="participants">
      <div
        v-for="(people, panelType, index) in participants"
        :key="`panelType-${panelType}`"
        class="participant-item"
        :class="participantPanels[index] ? 'participant-item--expanded' : 'participant-item--collapsed'"
      >
        <div class="participant-item-header" @click="() => toggleParticipantPanel(index)">
          <h6><span /> {{ $t(`proposal.${panelType}`) }} ({{ people.length }})</h6>
          <i
            :class="participantPanels[index] ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"
            type="button"
            tabindex="0"
            @keyup.enter="() => toggleParticipantPanel(index)"
          />
        </div>
        <div class="participant-item-content">
          <el-row
            v-for="({ fullName, participantType, email, action, actionTitle, isDisabled }, participantIndex) in people"
            :key="`participant-${participantIndex}`"
            type="flex"
            align="middle"
          >
            <el-col :span="6">{{ fullName }}</el-col>
            <el-col :span="6">
              <el-tag>
                {{ $t('proposal.participantCategory_' + participantType) }}
              </el-tag>
            </el-col>
            <el-col :span="6">{{ email }}</el-col>
            <el-col :span="6" class="action-column">
              <el-button
                v-if="action && actionTitle && participantPanels[index]"
                v-loading="isEmailSendingInProgress"
                type="text"
                :disabled="isDisabled || isEmailSendingInProgress || proposalStore.currentProposal?.isLocked"
                @click="action"
              >
                {{ $t(actionTitle) }}
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

import useNotifications from '@/composables/use-notifications'
import type { TranslationSchema } from '@/plugins/i18n'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import { useUserStore } from '@/stores/user.store'
import type { IResearcherIdentity, ParticipantType } from '@/types/proposal.types'

const { params } = useRoute()
const proposalId = params.id as string

const proposalStore = useProposalStore()
const userStore = useUserStore()
const { showErrorMessage, showSuccessMessage } = useNotifications()

interface ParticipantAction {
  action: () => void
  actionTitle: TranslationSchema
}

interface ParticipantInfo extends Partial<ParticipantAction> {
  fullName: string
  participantType: ParticipantType
  email: string
  isDisabled?: boolean
}

type PanelType = 'invitationPending' | 'registrationPending' | 'alreadyRegistered'

type ParticipantPanelType = Record<PanelType, ParticipantInfo[]>

let researcherIdentities = ref<Omit<IResearcherIdentity, 'username'>[]>([])
const participantsCount = ref(0)
const triggeredEmails = ref<string[]>([])
const getInvitationPendingAction = (identity: Omit<IResearcherIdentity, 'username'>): ParticipantAction => {
  return {
    action: () => createUser(identity),
    actionTitle: 'proposal.sendInvitation',
  }
}

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
</script>

<style lang="scss" scoped>
@import 'src/assets/sass/variable';

.participants {
  border-radius: 4px;
  border: 1px solid $gray-700;

  .participant-item {
    border-bottom: 1px solid $gray-700;

    &.participant-item--expanded {
      .participant-item-content {
        height: 100%;
      }
    }

    &.participant-item--collapsed {
      .participant-item-content {
        height: 0;
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
      transition-property: all;
      transition-duration: 100ms;
      transition-timing-function: linear;
      overflow: hidden;

      .el-row {
        padding: 13px 0;
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
</style>
