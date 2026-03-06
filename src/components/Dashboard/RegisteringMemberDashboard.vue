<
<template>
  <div class="fdpg-dashboard-page">
    <FdpgIAlertBox v-if="alertConfig.isVisible" :message="alertConfig.message" :logoBase64="alertConfig.logoBase64" />
    <PublishedPage />
  </div>
</template>

<script setup lang="ts">
import FdpgIAlertBox from '../FdpgIAlertBox.vue'
import { useConfigStore } from '@/stores/config/config.store'
import { computed } from 'vue'
import PublishedPage from '@/pages/PublishedPage.vue'

const configStore = useConfigStore()
const alertConfig = computed(() => configStore.alertConfig)
</script>

<style scoped></style>
