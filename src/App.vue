<template>
  <router-view />
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth/auth.store'
import type { Role } from './types/oidc.types'
import { transformKeycloakAttributesToDataSource } from './utils/user.util'

// After the profile change this logic updates the profile for the current session
const authStore = useAuthStore()
authStore.$oidc.events.addUserLoaded((user) => {
  if (user && user.profile) {
    user.profile.receiveProposalEmails =
      user.profile.receiveProposalEmails === 'true' || user.profile.receiveProposalEmails === undefined
  }

  authStore.setProfileUpdate(user.profile as any)
  const currentRole = localStorage.getItem('currentRole')
  if (user?.profile.realm_access?.roles.length) {
    if (currentRole && user?.profile.realm_access?.roles.includes(currentRole)) {
      authStore.setSelectedRole(currentRole as Role)
    } else {
      authStore.setSelectedRole(user?.profile.realm_access?.roles[0])
    }

    authStore.setAssignedDataSources(
      transformKeycloakAttributesToDataSource(user?.profile?.assignedDataSources, authStore.singleKnownRole),
    )
  }
})
</script>
