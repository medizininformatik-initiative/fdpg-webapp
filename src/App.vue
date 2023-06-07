<template>
  <router-view />
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth/auth.store'
import 'element-theme-chalk'

// After the profile change this logic updates the profile for the current session
const authStore = useAuthStore()
authStore.$oidc.events.addUserLoaded((user) => {
  authStore.setProfileUpdate(user.profile as any)
})
</script>
