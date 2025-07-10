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
                  label: '',
                  kind: 'basic',
                  isTranslatable: false,
                  disabled: !userHasPermission,
                }"
                :items="getParticipantCategoryItems(participant)"
                @select="handleParticipantTypeSelect(participant, $event)"
                :class="['dropdown-tag', `dropdown-tag--${panelType}`]"
                :data-testId="`participant-category-${participant.participantType}`"
                :show-dropdown-icon="true"
              >
                <span class="dropdown-lable">{{
                  t('proposal.participantCategory_' + participant.participantType)
                }}</span>
              </FdpgDropdown>
            </el-col>
            <el-col :span="4">
              <FdpgDropdown
                :button="{
                  label: '',
                  kind: 'basic',
                  isTranslatable: false,
                  disabled: !userHasPermission,
                }"
                :items="getParticipantRoleItems(participant)"
                @select="handleParticipantRoleSelect(participant, $event)"
                :show-dropdown-icon="true"
                :data-testId="`participant-role-${participant.participantRole}`"
                :class="['dropdown-tag', `dropdown-tag--${panelType}`]"
              >
                <span class="dropdown-lable">{{ t('roles.participantRole_' + participant.participantRole) }}</span>
              </FdpgDropdown>
            </el-col>
            <el-col :span="7">{{ participant.email }}</el-col>
            <el-col :span="5" class="action-column">
              <el-button
                v-if="participant.action && participant.actionTitle && participantPanels[index] && isFdpgMembers"
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
  <el-row v-if="isFdpgMembers" class="participants-footer" type="flex" justify="end" align="middle">
    <el-col :span="4" class="add-more-button-wrapper">
      <el-button
        link
        class="add-more-button add-more-button--another-person"
        data-testId="handleAddAnotherPerson"
        @click="handleAddAnotherPerson"
      >
        <i class="el-icon-plus" aria-hidden="true" />
        <span class="add-text">{{ t('proposal.addAnotherPerson') }}</span>
      </el-button>
    </el-col>
  </el-row>

  <AddParticipantDialog v-model="openParticipantDialog" @submit="handleParticipantSubmit" />
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
import { ParticipantType, ParticipantRole, ProposalStatus } from '@/types/proposal.types'
import { useAuthStore } from '@/stores/auth/auth.store'
import { Role } from '@/types/oidc.types'
import { Countries } from '@/types/location.enum'
import type { IParticipant } from '@/types/proposal.types'
import AddParticipantDialog from './AddParticipantDialog.vue'
import { mapParticipant } from '@/utils/form-transform/participant-applicant-transform.util'
import { useMessageBoxStore, type DecisionType } from '@/stores/messageBox.store'

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
const isEmailSendingInProgress = ref(false)
const participantPanels = ref<boolean[]>([])
const openParticipantDialog = ref<boolean>(false)

const authStore = useAuthStore()
const messageBoxStore = useMessageBoxStore()

const userRole = computed<Role | undefined>(() => {
  return authStore.singleKnownRole
})
const isFdpgMembers = computed(() => {
  return userRole.value === Role.FdpgMember
})

const isResearcher = computed(() => {
  return userRole.value === Role.Researcher
})

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
        acc.alreadyRegistered.push({
          ...result,
          ...(info.addedByFdpg ? removeParticipantAction(info.participantId) : {}),
        })
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
const userHasPermission = computed(
  () =>
    isFdpgMembers.value ||
    (isResearcher.value &&
      proposalStore.currentProposal?.status &&
      [ProposalStatus.Draft, ProposalStatus.Rework, ProposalStatus.FdpgCheck].includes(
        proposalStore.currentProposal.status,
      )),
)

const getInvitationPendingAction = (identity: Omit<IResearcherIdentity, 'username'>): ParticipantAction => {
  return {
    action: () => createUser(identity),
    actionTitle: 'proposal.sendInvitation',
  }
}

const getParticipantCategoryItems = (participant: ParticipantInfo): DropdownItem[] => {
  return Object.values(ParticipantType).map((type) => ({
    label: `proposal.participantCategory_${type}`,
    kind: 'basic',
    action: () => handleParticipantTypeSelect(participant, type),
    disabled: !userHasPermission.value,
  }))
}

const getParticipantRoleItems = (participant: ParticipantInfo): DropdownItem[] => {
  // Check if this participant is the only Responsible Scientist
  const isOnlyResponsibleScientist =
    participant.participantRole === ParticipantRole.ResponsibleScientist &&
    !researcherIdentities.value.some(
      (r) => r.participantRole === ParticipantRole.ResponsibleScientist && r.email !== participant.email,
    )

  return Object.values(ParticipantRole).map((role) => ({
    label: `roles.participantRole_${role}`,
    kind: 'basic',
    action: () => handleParticipantRoleSelect(participant, role),
    // Disable if user has no permission or if trying to change the only Responsible Scientist
    disabled: !userHasPermission.value || (isOnlyResponsibleScientist && role !== ParticipantRole.ResponsibleScientist),
  }))
}

const getRegistrationPendingAction = (
  identity: Pick<IResearcherIdentity | ParticipantInfo, 'email'>,
): ParticipantAction => {
  return {
    action: () => resendInvitation(identity),
    actionTitle: 'proposal.resendInvitation',
  }
}

const handleAddAnotherPerson = async () => {
  openParticipantDialog.value = true
}

const removeParticipantAction = (id: string | undefined): ParticipantAction => {
  return {
    action: () => handleRemoveParticipant(id),
    actionTitle: 'proposal.removeParticipant',
  }
}
const handleRemoveParticipant = async (id: string | undefined): Promise<void> => {
  return new Promise((resolve) => {
    messageBoxStore.setMessageBoxInfo({
      cancelButtonText: 'general.cancel',
      cancelButtonClass: 'el-button--text',
      showCancelButton: true,
      title: 'proposal.removeParticipant',
      message: 'proposal.removeParticipantModalDescription',
      confirmButtonText: 'proposal.acceptContractDizModalAction',
      callback: async (decision: DecisionType) => {
        if (decision === 'confirm') {
          await removeParticipant(id)
        }
        resolve()
      },
    })
  })
}
const removeParticipant = async (id: string | undefined) => {
  if (!id) {
    showErrorMessage(t('proposal.errorNoParticipantId'))
    return
  }
  try {
    await proposalStore.removeParticipant(proposalId, id)
    researcherIdentities.value = await proposalStore.getResearcherInfo(proposalId)
    participantsCount.value = researcherIdentities.value.length
    showSuccessMessage()
  } catch (error) {
    console.error('Error removing participant:', error)
    showErrorMessage()
  }
}
onBeforeMount(async () => {
  try {
    researcherIdentities.value = await proposalStore.getResearcherInfo(proposalId)
    participantsCount.value = researcherIdentities.value.length
  } catch (error) {
    console.log(error)
  }
})

const toggleParticipantPanel = (id: number) => {
  participantPanels.value[id] = !participantPanels.value[id]
}

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

const handleParticipantTypeSelect = async (participant: ParticipantInfo, newType: ParticipantType) => {
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

const handleParticipantRoleSelect = async (participant: ParticipantInfo, newRole: ParticipantRole) => {
  try {
    // Prevent changing role if this is the only Responsible Scientist
    if (
      participant.participantRole === ParticipantRole.ResponsibleScientist &&
      newRole !== ParticipantRole.ResponsibleScientist &&
      !researcherIdentities.value.some(
        (r) => r.participantRole === ParticipantRole.ResponsibleScientist && r.email !== participant.email,
      )
    ) {
      showErrorMessage(t('proposal.cannotChangeOnlyResponsibleScientist'))
      return
    }

    if (newRole === ParticipantRole.ResponsibleScientist) {
      const existingResponsibleScientist = researcherIdentities.value.find(
        (r) => r.participantRole === ParticipantRole.ResponsibleScientist && r.email !== participant.email,
      )
      if (existingResponsibleScientist) {
        existingResponsibleScientist.participantRole = ParticipantRole.ParticipatingScientist
      }
    }

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
        if (
          newRole === ParticipantRole.ResponsibleScientist &&
          p.participantRole.role === ParticipantRole.ResponsibleScientist &&
          p.researcher.email !== participant.email
        ) {
          return {
            ...p,
            participantRole: {
              ...p.participantRole,
              role: ParticipantRole.ParticipatingScientist,
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

const handleParticipantSubmit = async (newParticipant: IParticipant) => {
  try {
    const currentProposal = proposalStore.currentProposal
    if (!currentProposal) {
      showErrorMessage(t('proposal.errorNoProposalFound'))
      return
    }

    const participantToAdd = newParticipant

    const participantToAddTransformed = mapParticipant(participantToAdd) as IParticipant

    const updatedParticipants = [...(currentProposal.participants || []), participantToAddTransformed]
    await proposalStore.updateParticipants(proposalId, updatedParticipants)

    researcherIdentities.value = await proposalStore.getResearcherInfo(proposalId)
    participantsCount.value = researcherIdentities.value.length

    showSuccessMessage()
  } catch (error) {
    console.error('Error adding participant:', error)
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
        align-items: center;

        &:not(:last-child) {
          border-bottom: 1px solid $gray-200;
        }

        .el-col {
          &:first-child {
            font-weight: 500;
          }

          &:last-child {
            overflow-wrap: break-word;
            word-wrap: break-word;
            word-break: break-all;
          }
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

.dropdown-tag {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  border-radius: 15px;
  border: none;
  min-height: 32px;
  height: 32px;
  line-height: 32px;
  min-width: 120px;
  max-width: 160px;
}

.dropdown-tag--invitationPending {
  background-color: $gray-800;
}
.dropdown-tag--registrationPending {
  background-color: $blue;
}
.dropdown-tag--alreadyRegistered {
  background-color: $green;
}

.dropdown-tag--alreadyRegistered .menu-button .caret-icon,
.dropdown-tag--registrationPending .menu-button .caret-icon,
.dropdown-tag--invitationPending .menu-button .caret-icon {
  color: $white !important;
  font-size: 0.8rem;
}
.dropdown-lable {
  color: $white !important;
  font-size: 0.8rem;
  font-weight: normal;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
  display: inline-block;
}
.add-more-button-wrapper {
  display: flex;
  justify-content: flex-end;
}
</style>
