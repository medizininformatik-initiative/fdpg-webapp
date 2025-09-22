<template>
  <div class="location-page">
    <div class="header">
      <div class="lead">
        <h2 class="title">
          {{ t('general.locations') }}
        </h2>
      </div>
    </div>
    <el-tabs v-model="activeTab" class="demo-tabs" @tab-click="handleClick">
      <el-tab-pane :label="t('general.locations')" name="locations">
        <LocationOverviewTable />
      </el-tab-pane>
      <el-tab-pane :label="t('general.changelogs')" name="changelogs">
        <LocationChangelogOverview />
      </el-tab-pane>
      <el-tab-pane :label="t('general.pendingChanges')" name="pendingChanges">
        <LocationChangelogApproval />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { useLocationStore } from '@/stores/locations/location.store'
import { onMounted, ref } from 'vue'
const { t } = useI18n()
const locationStore = useLocationStore()

import type { TabsPaneContext } from 'element-plus'
import { useI18n } from 'vue-i18n'
import LocationOverviewTable from './LocationOverviewTable.vue'
import LocationChangelogOverview from './LocationChangelogOverview.vue'
import LocationChangelogApproval from './LocationChangelogApproval.vue'

const activeTab = ref('locations')

const handleClick = (tab: TabsPaneContext, event: Event) => {
  console.log(tab, event)
}

onMounted(async () => {})
</script>

<style lang="scss" scoped>
@use '@/assets/sass/variable' as *;

.location-page {
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 29px;

    .lead {
      .title {
        font-size: 32px;
        margin-top: 0;
        margin-bottom: 3px;
      }

      .description {
        font-weight: 600;
        margin: 0;
      }
    }
  }
}
</style>
