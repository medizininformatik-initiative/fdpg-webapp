<template>
  <ResearcherDashboard v-if="singleKnownRole === Role.Researcher" />
  <FdpgMemberDashboard v-else-if="singleKnownRole === Role.FdpgMember" />
  <DizAndUacMemberDashboard v-else-if="singleKnownRole === Role.DizMember || singleKnownRole === Role.UacMember" />
  <AdminDashboard v-else-if="singleKnownRole === Role.Admin" />
  <NoRoleDashboard v-else />
</template>
<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { useAuthStore } from '@/stores/auth/auth.store'
import { Role } from '@/types/oidc.types';

const ResearcherDashboard = defineAsyncComponent(() => import('./ResearcherDashboard.vue'))
const FdpgMemberDashboard = defineAsyncComponent(() => import('./FdpgMemberDashboard.vue'))
const DizAndUacMemberDashboard = defineAsyncComponent(() => import('./LocationDashboard.vue'))
const AdminDashboard = defineAsyncComponent(() => import('./AdminDashboard.vue'))
const NoRoleDashboard = defineAsyncComponent(() => import('./NoRoleDashboard.vue'))
const authStore = useAuthStore()
const singleKnownRole = computed(() => authStore.singleKnownRole)
</script>
