<template>
  <div class="location-page">
    <div class="header">
      <div class="lead">
        <h2 class="title">
          {{ t('general.locations') }}
        </h2>
      </div>
    </div>

    <div class="sync-bottom-row">
      <el-button type="primary" @click="syncLocations" :disabled="isLoading" v-bind:loading="isLoading">
        {{ t('general.syncLocations') }}
      </el-button>
    </div>

    <el-tabs v-model="activeTab">
      <el-tab-pane :label="t('general.locations')" name="locations">
        <LocationOverviewTable :locations="locationsRef" :loading="isLoading" @updateLocation="updateLocation" />
      </el-tab-pane>
      <el-tab-pane :label="t('general.changelogs') + (pendingCount > 0 ? ` (${pendingCount})` : '')" name="changelogs">
        <LocationChangelogOverview :changelogs="changelogRef" :loading="isLoading" @setStatus="setChangelogStatus" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { useLocationStore } from '@/stores/locations/location.store'
import { computed, onMounted, ref, type Ref } from 'vue'
const { t } = useI18n()
const locationStore = useLocationStore()
const { showErrorMessage } = useNotifications()

import { useI18n } from 'vue-i18n'
import LocationOverviewTable from './LocationOverviewTable.vue'
import LocationChangelogOverview from './LocationChangelogOverview.vue'
import { LocationSyncChangeLogStatus, type ILocation, type ILocationSyncChangelog } from '@/types/location.types'
import useNotifications from '@/composables/use-notifications'

const activeTab = ref('locations')

const locationsRef: Ref<ILocation[]> = ref([])
const changelogRef: Ref<ILocationSyncChangelog[]> = ref([])
const isLoading: Ref<boolean> = ref(false)
const pendingCount = computed(
  () => changelogRef.value.filter((c) => c.status === LocationSyncChangeLogStatus.PENDING).length,
)

const setChangelogStatus = async (changelog: ILocationSyncChangelog, status: LocationSyncChangeLogStatus) => {
  await wrapWithLoading(async () => {
    const toUpdate = { ...changelog, status }
    await locationStore.setChangelogStatus(toUpdate)

    const changelogs = await locationStore.getAllChangelogs()
    changelogRef.value = changelogs

    const locations = await locationStore.getAll(false)
    locationsRef.value = locations
  })
}

const syncLocations = async () => {
  await wrapWithLoading(async () => {
    const updatedChangelogs = await locationStore.syncLocations()
    changelogRef.value = [...updatedChangelogs]
  })
}

const updateLocation = async (location: ILocation) => {
  await wrapWithLoading(async () => {
    await locationStore.updateLocation(location)

    const locations = await locationStore.getAll(false)
    locationsRef.value = locations
  })
}

const setLoading = (loading: boolean) => {
  isLoading.value = loading
}

const wrapWithLoading = async (cb: Function) => {
  setLoading(true)
  try {
    await cb()
  } catch (e) {
    console.warn(e)
    showErrorMessage()
  } finally {
    setLoading(false)
  }
}

onMounted(async () => {
  await wrapWithLoading(async () => {
    const locations = await locationStore.getAll(false)
    locationsRef.value = locations

    const changelogs = await locationStore.getAllChangelogs()
    changelogRef.value = changelogs
  })
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

  .sync-bottom-row {
    display: flex;
    width: 100%;
    flex-direction: row;
    justify-content: flex-end;
  }
}
</style>
