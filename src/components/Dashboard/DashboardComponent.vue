<template>
  <ResearcherDashboard v-if="singleKnownRole === Role.Researcher" />
  <FdpgMemberDashboard v-else-if="isFdpgLevelUser" />
  <DizAndUacMemberDashboard v-else-if="singleKnownRole === Role.DizMember || singleKnownRole === Role.UacMember" />
  <DmsDashboard v-else-if="singleKnownRole === Role.DataManagementOffice" />
  <AdminDashboard v-else-if="singleKnownRole === Role.Admin" />
  <RegisteringMemberDashboard v-else-if="singleKnownRole === Role.RegisteringMember" />
  <NoRoleDashboard v-else />
</template>
<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { useAuthStore } from '@/stores/auth/auth.store'
import { Role } from '@/types/oidc.types'

const ResearcherDashboard = defineAsyncComponent(() => import('./ResearcherDashboard.vue'))
const FdpgMemberDashboard = defineAsyncComponent(() => import('./FdpgMemberDashboard.vue'))
const DizAndUacMemberDashboard = defineAsyncComponent(() => import('./LocationDashboard.vue'))
const DmsDashboard = defineAsyncComponent(() => import('./DmsDashboard.vue'))
const AdminDashboard = defineAsyncComponent(() => import('./AdminDashboard.vue'))
const RegisteringMemberDashboard = defineAsyncComponent(() => import('./RegisteringMemberDashboard.vue'))
const NoRoleDashboard = defineAsyncComponent(() => import('./NoRoleDashboard.vue'))
const authStore = useAuthStore()
const singleKnownRole = computed(() => authStore.singleKnownRole)
const isFdpgLevelUser = computed(() => authStore.hasFdpgLevelPermissions())
</script>
