<template>
  <router-view />
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth/auth.store'
import 'element-theme-chalk'
import type { Role } from './types/oidc.types';

// After the profile change this logic updates the profile for the current session
const authStore = useAuthStore()
authStore.$oidc.events.addUserLoaded((user) => {
  authStore.setProfileUpdate(user.profile as any)
  const currentRole = localStorage.getItem('currentRole')
  if (user?.profile.realm_access?.roles.length) {
    if (currentRole && user?.profile.realm_access?.roles.includes(currentRole)) {
      authStore.setSelectedRole((currentRole) as Role)
    } else {
      authStore.setSelectedRole(user?.profile.realm_access?.roles[0])
    }
  }
})
</script>
