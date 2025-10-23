<template>
  <ResearcherDashboard v-if="singleKnownRole === Role.Researcher" />
  <FdpgMemberDashboard v-else-if="isFdpgLevelUser" />
  <DizAndUacMemberDashboard v-else-if="singleKnownRole === Role.DizMember || singleKnownRole === Role.UacMember" />
  <AdminDashboard v-else-if="singleKnownRole === Role.Admin" />
  <RegisteringMemberDashboard v-else-if="singleKnownRole === Role.RegisteringMember" />
  <NoRoleDashboard v-else />
</template>
<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth/auth.store'
import { Role } from '@/types/oidc.types'
import { useConfigStore } from '@/stores/config/config.store'

const ResearcherDashboard = defineAsyncComponent(() => import('./ResearcherDashboard.vue'))
const FdpgMemberDashboard = defineAsyncComponent(() => import('./FdpgMemberDashboard.vue'))
const DizAndUacMemberDashboard = defineAsyncComponent(() => import('./LocationDashboard.vue'))
const AdminDashboard = defineAsyncComponent(() => import('./AdminDashboard.vue'))
const RegisteringMemberDashboard = defineAsyncComponent(() => import('./RegisteringMemberDashboard.vue'))
const NoRoleDashboard = defineAsyncComponent(() => import('./NoRoleDashboard.vue'))
const authStore = useAuthStore()
const configStore = useConfigStore()
const singleKnownRole = computed(() => authStore.singleKnownRole)
const isFdpgLevelUser = computed(() => authStore.hasFdpgLevelPermissions())

onMounted(() => {
  configStore.getAlertConfig()
})
</script>
