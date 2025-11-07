<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useLocationStore } from '@/stores/locations/location.store.ts'
import { computed, onMounted, ref } from 'vue'
import FdpgSelect, { type SelectOption } from '@/components/FdpgSelect.vue'
import { useProposalStore } from '@/stores/proposal/proposal.store.ts'
import FdpgDialog from '@/components/FdpgDialog.vue'

const { t } = useI18n()
const locationStore = useLocationStore()
const proposalStore = useProposalStore()

const locationSelectModel = ref<string>('')
const isDmsOverrideDialogOpen = ref<boolean>(false)

const dataManagementSite = computed(() => {
  return proposalStore.currentProposal?.dataDelivery?.dataManagementSite || undefined
})

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
    await proposalStore.updateDmsForDataDelivery(proposalId, locationId)
  }

  isDmsOverrideDialogOpen.value = false
}

onMounted(() => {
  locationStore.getAll()
})
</script>

<template v-if="dataManagementSite !== undefined">
  <el-button class="dms__reset" link @click="isDmsOverrideDialogOpen = true">
    {{ t('dataDelivery.newRequest') }}
  </el-button>
  <FdpgDialog
    :title="t('dataDelivery.newRequestConfirmationQuestion')"
    v-model="isDmsOverrideDialogOpen"
    @close="isDmsOverrideDialogOpen = false"
  >
    <form class="dms__form" @submit.prevent="handleSubmit">
      <div id="dms-help" class="dms__help">
        <p>
          {{ t('dataDelivery.oldRequestOverrideInfo', { dms: dataManagementSite }) }}
        </p>
        <p class="dms__help">{{ t('dataDelivery.proceedAnywayQuestion') }}</p>
      </div>

      <FdpgSelect
        v-model="locationSelectModel"
        :options="dmsLocationSelectOptionList"
        :placeholder="t('dataDelivery.selectDataManagementSite')"
        aria-describedby="dms-help"
      />

      <div class="dms__actions">
        <el-button link @click="isDmsOverrideDialogOpen = false">{{ t('dataDelivery.cancel') }}</el-button>
        <el-button native-type="submit" :disabled="isSubmitButtonDisabled" type="primary" class="dms__button">
          {{ t('dataDelivery.sendRequest') }}
        </el-button>
      </div>
    </form>
  </FdpgDialog>
</template>

<style scoped lang="scss">
@use '@/assets/sass/variable' as *;

.dms__reset {
  color: $blue;
}

.dms__form {
  border-radius: 3px;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: -1.5rem; // circumvent the FdpgDialog footer slot design
}

.dms__title {
  font-size: 1rem;
  line-height: 1.5rem;
  margin: 0 0 1rem 0;
}

.dms__help {
  color: $black;
  margin: 0;
  line-height: 125%;

  p {
    margin: 0;
  }
}

.dms__current-site {
  font-weight: 600;
}

.dms__actions {
  display: flex;
  justify-content: flex-end;
}
</style>
