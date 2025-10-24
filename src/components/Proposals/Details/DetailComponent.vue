<template>
  <ResearcherDetails v-if="singleKnownRole === Role.Researcher || singleKnownRole === Role.RegisteringMember" />
  <FdpgMemberDetails v-if="singleKnownRole === Role.FdpgMember || singleKnownRole === Role.DataSourceMember" />
  <DizMemberDetails v-if="singleKnownRole === Role.DizMember" />
  <UacMemberDetails v-if="singleKnownRole === Role.UacMember" />
</template>
<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { useAuthStore } from '@/stores/auth/auth.store'
import { Role } from '@/types/oidc.types'

const ResearcherDetails = defineAsyncComponent(() => import('./ResearcherDetails.vue'))
const FdpgMemberDetails = defineAsyncComponent(() => import('./FdpgMemberDetails.vue'))
const DizMemberDetails = defineAsyncComponent(() => import('./DizMemberDetails.vue'))
const UacMemberDetails = defineAsyncComponent(() => import('./UacMemberDetails.vue'))
const authStore = useAuthStore()
const singleKnownRole = computed(() => authStore.singleKnownRole)
</script>
