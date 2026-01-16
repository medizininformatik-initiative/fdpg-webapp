<template>
  <DataSourcePanel v-if="isFdpgMember" />
  <NoRoleDashboard v-else />
</template>
<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { useAuthStore } from '@/stores/auth/auth.store'
import { Role } from '@/types/oidc.types'
const DataSourcePanel = defineAsyncComponent(() => import('./DataSourcePanel.vue'))
const NoRoleDashboard = defineAsyncComponent(() => import('../Dashboard/NoRoleDashboard.vue'))
const authStore = useAuthStore()
const isFdpgMember = computed(() => authStore.singleKnownRole === Role.FdpgMember)
</script>
