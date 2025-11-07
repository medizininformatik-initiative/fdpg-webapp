<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useLocationStore } from '@/stores/locations/location.store.ts'
import { computed, onMounted, ref } from 'vue'
import FdpgSelect, { type SelectOption } from '@/components/FdpgSelect.vue'
import { useProposalStore } from '@/stores/proposal/proposal.store.ts'

const { t } = useI18n()
const locationStore = useLocationStore()
const proposalStore = useProposalStore()

const locationSelectModel = ref<string>('')

const dmsLocationSelectOptionList = computed<SelectOption[]>(() =>
  locationStore.allLocations
    .filter((location) => location.dataManagementCenter)
    .map((location) => ({ label: location.display, value: location._id })),
)

const isSubmitButtonDisabled = computed<boolean>(() => locationSelectModel.value === '')

const handleSubmit = async () => {
  const proposalId = proposalStore.currentProposal?._id
  const locationId = locationSelectModel.value

  if (proposalId !== undefined && proposalId !== '' && locationId !== undefined && locationId !== '') {
    await proposalStore.registerDataDeliveryRequestAtDms(proposalId, locationId)
  }
}

onMounted(() => {
  locationStore.getAll()
})
</script>

<template>
  <form class="dms__form" @submit.prevent="handleSubmit">
    <h3 class="dms__title">{{ t('dataDelivery.dataManagementSite') }}</h3>

    <FdpgSelect
      v-model="locationSelectModel"
      :options="dmsLocationSelectOptionList"
      :placeholder="t('dataDelivery.selectDataManagementSite')"
      aria-describedby="dms-help"
    />

    <p id="dms-help" class="dms__help">{{ t('dataDelivery.selectDataManagementSiteInfoText') }}</p>

    <div class="dms__actions">
      <el-button
        native-type="submit"
        :plain="!isSubmitButtonDisabled"
        :disabled="isSubmitButtonDisabled"
        type="primary"
        class="dms__button"
      >
        {{ t('dataDelivery.sendRequest') }}
      </el-button>
    </div>
  </form>
</template>

<style scoped lang="scss">
@use '@/assets/sass/variable' as *;

.dms__form {
  border: 1px solid $gray-700;
  padding: 19px;
  border-radius: 3px;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.dms__title {
  font-size: 1rem;
  line-height: 1.5rem;
  margin: 0;
}

.dms__help {
  color: $black;
  margin: 0;
}

.dms__actions {
  display: flex;
  justify-content: flex-end;
}
</style>
