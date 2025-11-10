<template>
  <FdpgDialog
    :title="t('dataDelivery.newRequestConfirmationQuestion')"
    v-model="dialogVisible"
    @close="() => setDialogOpen(false)"
  >
    <form class="dms__form" @submit.prevent="handleSubmit">
      <div v-if="dataManagementSite" id="dms-help" class="dms__help">
        <p>
          {{
            t('dataDelivery.oldRequestOverrideInfo', {
              dms: locationLookupMap[dataManagementSite]?.display ?? dataManagementSite,
            })
          }}
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
        <el-button link @click="() => setDialogOpen(false)">{{ t('dataDelivery.cancel') }}</el-button>
        <el-button native-type="submit" :disabled="isSubmitButtonDisabled" type="primary" class="dms__button">
          {{ t('dataDelivery.sendRequest') }}
        </el-button>
      </div>
    </form>
  </FdpgDialog>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useLocationStore } from '@/stores/locations/location.store.ts'
import { computed, onMounted, ref } from 'vue'
import FdpgSelect, { type SelectOption } from '@/components/FdpgSelect.vue'
import FdpgDialog from '@/components/FdpgDialog.vue'
import { useVModel } from '@vueuse/core'
import type { ILocation } from '@/types/location.types'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  dataManagementSite: {
    type: [String, null],
    required: true,
  },
})

const emit = defineEmits(['dialogOpenState', 'submit'])
const dialogVisible = useVModel(props, 'modelValue', emit)

const { t } = useI18n()
const locationStore = useLocationStore()

const locationSelectModel = ref<string>('')
const selectableLocations = ref<ILocation[]>([])

const locationLookupMap = ref<Record<string, ILocation>>({})

const dmsLocationSelectOptionList = computed<SelectOption[]>(() =>
  selectableLocations.value.map((location) => ({ label: location.display, value: location._id })),
)

const isSubmitButtonDisabled = computed<boolean>(() => locationSelectModel.value === '')

const handleSubmit = async () => {
  const locationId = locationSelectModel.value

  emit('submit', locationId)

  setDialogOpen(false)
}

const setDialogOpen = (openState: boolean) => {
  emit('dialogOpenState', openState)
}

onMounted(async () => {
  const locations = await locationStore.getAll()
  selectableLocations.value = locations.filter((loc) => loc.dataManagementCenter)

  locationLookupMap.value = await locationStore.getLocationLookupMap()
})
</script>

<style scoped lang="scss">
@use '@/assets/sass/variable' as *;

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
