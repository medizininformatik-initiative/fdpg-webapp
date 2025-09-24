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
        <LocationOverviewTable :locations="locationsRef" />
      </el-tab-pane>
      <el-tab-pane :label="t('general.changelogs') + (pendingCount > 0 ? ` (${pendingCount})` : '')" name="changelogs">
        <LocationChangelogOverview :changelogs="changelogRef" @setStatus="setChangelogStatus" />
      </el-tab-pane>
      <!-- <el-tab-pane :label="t('general.pendingChanges')" name="pendingChanges">
        <LocationChangelogApproval />
      </el-tab-pane> -->
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { useLocationStore } from '@/stores/locations/location.store'
import { computed, onMounted, ref, type Ref } from 'vue'
const { t } = useI18n()
const locationStore = useLocationStore()

import type { TabsPaneContext } from 'element-plus'
import { useI18n } from 'vue-i18n'
import LocationOverviewTable from './LocationOverviewTable.vue'
import LocationChangelogOverview from './LocationChangelogOverview.vue'
import LocationChangelogApproval from './LocationChangelogApproval.vue'
import { LocationSyncChangeLogStatus, type ILocation, type ILocationSyncChangelog } from '@/types/location.types'

const activeTab = ref('locations')

const handleClick = (tab: TabsPaneContext, event: Event) => {
  console.log(tab, event)
}

const locationsRef: Ref<ILocation[]> = ref([])
const changelogRef: Ref<ILocationSyncChangelog[]> = ref([])
const pendingCount = computed(
  () => changelogRef.value.filter((c) => c.status === LocationSyncChangeLogStatus.PENDING).length,
)

const setChangelogStatus = async (changelog: ILocationSyncChangelog, status: LocationSyncChangeLogStatus) => {
  console.log({ changelog, status })
  const toUpdate = { ...changelog, status }
  await locationStore.setChangelogStatus(toUpdate)
}

onMounted(async () => {
  const locations = await locationStore.getAll()
  locationsRef.value = locations

  const changelogs = await locationStore.getAllChangelogs()
  changelogRef.value = changelogs
    .map((changelog) => {
      changelog.created = new Date(changelog.created)
      return changelog
    })
    .sort((a, b) => b.created.getTime() - a.created.getTime())

  console.log({ changelogs })
})
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
