<template>
  <section class="section user-profile">
    <h1 class="title">
      {{ t('general.userProfile') }}
    </h1>

    <h2>{{ t('general.userProfilePersonalData') }}</h2>
    <DefinitionCard :card="personalCard" :dto="authStore"></DefinitionCard>

    <h2>{{ t('general.userProfileOrganizationData') }}</h2>

    <div class="info-box">
      <span class="icon fa-solid fa-circle-info" aria-hidden="true" />
      <span>{{ t('general.changeOrganizationHint') }}</span>
    </div>
    <DefinitionCard
      v-if="organizationCardConfig && organizationCardConfig.card && organizationCardConfig.dto"
      :card="organizationCardConfig.card"
      :dto="organizationCardConfig.dto"
    ></DefinitionCard>

    <EditProfileDialog v-model="isEditProfileDialogOpen" />
  </section>
</template>
<script setup lang="ts">
import EditProfileDialog from '@/components/EditProfileDialog.vue'
import DefinitionCard from '@/components/Shared/DefinitionCard.vue'
import type { IDefinitionCardVirtual, IVirtualWrap } from '@/components/Shared/definition-card.types'
import useNotifications from '@/composables/use-notifications'
import { useAuthStore } from '@/stores/auth/auth.store'
import { useLocationStore } from '@/stores/locations/location.store'
import { useMessageBoxStore, type DecisionType } from '@/stores/messageBox.store'
import { useUserStore } from '@/stores/user.store'
import type { ILocation } from '@/types/location.types'
import type { IOidc, IOidcProfile, IUserFromExternalOrganization, IUserFromMii } from '@/types/oidc.types'
import { computed, onMounted, ref, type ComputedRef, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const authStore = useAuthStore()
const userStore = useUserStore()
const messageBoxStore = useMessageBoxStore()
const { showErrorMessage, showSuccessMessage } = useNotifications()

const locationStore = useLocationStore()
const locationLookUpMapRef: Ref<Record<string, ILocation>> = ref({})

const isPasswordResetDisabled = ref(false)
const resetPassword = () => {
  const userId = authStore.profile?.sub

  isPasswordResetDisabled.value = true
  setTimeout(() => {
    isPasswordResetDisabled.value = false
  }, 60_000)

  try {
    if (userId) {
      userStore.resetPassword(userId)
      showSuccessMessage()
    } else {
      throw new Error('No User ID')
    }
  } catch {
    showErrorMessage()
  }
}

const handleResetPassword = () => {
  messageBoxStore.setMessageBoxInfo({
    cancelButtonText: 'general.cancel',
    cancelButtonClass: 'el-button--text',
    showCancelButton: true,
    title: 'general.resetPasswordModalTitle',
    message: 'general.resetPasswordModalDescription',
    confirmButtonText: 'general.resetPasswordModalAction',
    callback: async (decision: DecisionType) => (decision === 'confirm' ? await resetPassword() : undefined),
  })
}

const isEditProfileDialogOpen = ref(false)
const handleEditProfile = () => {
  isEditProfileDialogOpen.value = true
}
const personalCard: IDefinitionCardVirtual<IOidc, 'profile'> = {
  kind: 'virtual',
  cardLabel: 'countries.AD',
  key: 'profile',
  terms: [
    {
      label: 'general.salutation',
      size: 24,
      definitions: [[{ key: 'salutation', kind: 'translatable', prefix: 'general.salutation_' }]],
    },
    {
      label: 'general.titleAndName',
      size: 24,
      definitions: [[{ key: 'title' }], [{ key: 'given_name' }, { key: 'family_name' }]],
    },
    {
      label: 'proposal.belongingOptional',
      size: 12,
      definitions: [[{ key: 'affiliation' }]],
    },
    {
      label: 'proposal.emailAddress',
      size: 12,
      definitions: [[{ key: 'email' }]],
    },
    {
      label: 'general.receiveProposalEmails',
      size: 12,
      definitions: [[{ key: 'receiveProposalEmails', kind: 'translatable', prefix: 'general.boolean_' }]],
    },
  ],
  actions: [
    {
      label: 'general.resetPassword',
      disabled: isPasswordResetDisabled,
      onClick: handleResetPassword,
    },
    {
      label: 'general.editProfile',
      onClick: handleEditProfile,
    },
  ],
}

const organizationCardConfig = computed(() => {
  if (authStore.profile && 'MII_LOCATION' in authStore.profile) {
    return {
      dto: {
        content: authStore.profile,
      },
      card: miiLocationCard.value,
    }
  } else if (authStore.profile && 'organization' in authStore.profile) {
    return {
      dto: authStore.profile,
      card: externalOrganizationCard,
    }
  }
  return undefined
})

const miiLocationCard: ComputedRef<IDefinitionCardVirtual<IVirtualWrap<IOidcProfile & IUserFromMii>, 'content'>> =
  computed(() => ({
    kind: 'virtual',
    key: 'content',
    cardLabel: 'general.applicant',
    terms: [
      {
        label: 'proposal.fullCorrectNameOfTheInstitutionFacilityJurPerson',
        size: 24,
        definitions: [
          [
            {
              key: 'MII_LOCATION',
              kind: 'lookup',
              lookupMap: locationLookUpMapRef.value,
              lookupKey: 'display',
            },
          ],
        ],
      },
    ],
  }))

const externalOrganizationCard: IDefinitionCardVirtual<IOidcProfile & IUserFromExternalOrganization, 'organization'> = {
  kind: 'virtual',
  cardLabel: 'countries.AD',
  key: 'organization',
  terms: [
    {
      label: 'proposal.fullCorrectNameOfTheInstitutionFacilityJurPerson',
      size: 24,
      definitions: [[{ key: 'name' }]],
    },
    {
      label: 'general.address',
      size: 12,
      definitions: [
        [{ key: 'street' }, { key: 'houseNumber' }],
        [{ key: 'postalCode' }, { key: 'city' }],
        [{ key: 'country', prefix: 'countries.', kind: 'translatable' }],
      ],
    },
    {
      label: 'proposal.emailAddress',
      size: 12,
      definitions: [[{ key: 'email' }]],
    },
  ],
}

onMounted(async () => {
  const lm = await locationStore.getLocationLookupMap()
  locationLookUpMapRef.value = lm
})
</script>
<style lang="scss" scoped>
@use '@/assets/sass/variable' as *;

.user-profile {
  margin-bottom: 30px;

  .title {
    font-size: 32px;
    margin-top: 0;
    margin-bottom: 3px;
  }

  .info-box {
    padding: 0 1.3em;
    margin-bottom: 0.5em;

    .icon {
      margin-right: 0.5em;
      color: $blue;
    }
  }
}
</style>
