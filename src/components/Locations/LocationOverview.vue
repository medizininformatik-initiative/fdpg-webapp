<template>
  <LocationPanel v-if="isFdpgLevelUser" />
  <NoRoleDashboard v-else />
</template>
<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { useAuthStore } from '@/stores/auth/auth.store'
const LocationPanel = defineAsyncComponent(() => import('./LocationPanel.vue'))
const NoRoleDashboard = defineAsyncComponent(() => import('../Dashboard/NoRoleDashboard.vue'))
const authStore = useAuthStore()
const isFdpgLevelUser = computed(() => authStore.hasFdpgLevelPermissions())
</script>
