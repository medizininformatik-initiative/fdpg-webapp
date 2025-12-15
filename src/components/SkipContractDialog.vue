<template>
  <FdpgDialog
    v-model="dialogOpen"
    class="initiate-contract-dialog"
    width="50%"
    :title="t('proposal.toContractingSkipModalTitle')"
    :before-close="closeDialog"
    :show-close="false"
  >
    <div>
      <p>{{ t('proposal.toContractingSkipModalDescription') }}</p>
      <div v-if="contractSkipFile" class="fdpg-upload-list-item">
        <p class="fdpg-upload-file__name">{{ contractSkipFile.name }}</p>
        <span>({{ ((contractSkipFile?.size ?? 0) / 1024).toFixed(1) }}KB)</span>
        <el-icon
          class="el-icon-close"
          data-testId="icon__removeInitiateContractFile"
          tabindex="0"
          @click="handleRemoveFile()"
          @keydown.enter="handleRemoveFile()"
        />
      </div>
      <FdpgUpload
        accept=".pdf"
        :hide-file-list="true"
        :file-list="uploadsForType"
        :is-loading="false"
        :is-disabled="isSubmitting"
        @change="handleUploadFile"
      >
        <el-button v-if="!contractSkipFile" class="upload-button" link>
          {{ t('proposal.chooseAFile') }}
          <template #icon>
            <el-icon class="bi-paperclip"></el-icon>
          </template>
        </el-button>
      </FdpgUpload>
    </div>
    <div>
      <FdpgLabel html-for="general.locations" />
      <LocationSelect
        v-model="selectedLocations"
        placeholder="proposal.pleaseSelectYourLocations"
        :minimum-selection="[]"
        :all-locations="possibleLocations"
      />
    </div>
    <template #footer>
      <span>
        <el-button link data-testId="button__closeInitiateContractSkipDialog" @click="closeDialog">
          {{ t('general.cancel') }}
        </el-button>
        <el-button
          type="primary"
          :disabled="initiateContractSkipButtonDisabled"
          data-testid="button__initiateContract"
          @click="initiateSkipContract"
        >
          {{ t('proposal.initiateContractSkip') }}
        </el-button>
      </span>
    </template>
  </FdpgDialog>
</template>

<script setup lang="ts">
import type { UploadFile } from 'element-plus'
import { computed, onMounted, ref, watch, type PropType, type Ref } from 'vue'
import { useRoute } from 'vue-router'
import FdpgUpload from '@/components/FdpgUpload.vue'
import FdpgDialog from '@/components/FdpgDialog.vue'
import useNotifications from '@/composables/use-notifications'
import useUpload from '@/composables/use-upload'
import { UseCaseUpload } from '@/types/upload.types'
import { useVModel } from '@vueuse/core'
import { useLocationStore } from '@/stores/locations/location.store'
import type { ILocation } from '@/types/location.types'
import { useI18n } from 'vue-i18n'
import LocationSelect from './LocationSelect.vue'

const emit = defineEmits(['update:modelValue', 'closeDialog', 'initiateContractSkip'])

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  locations: {
    type: Array as PropType<string[]>,
    required: true,
  },
  isSubmitting: {
    type: Boolean,
    required: true,
  },
})

const dialogOpen = useVModel(props, 'modelValue', emit)
const closeDialog = () => {
  contractSkipFile.value = null
  dialogOpen.value = false
}

const { params } = useRoute()
const proposalId = computed(() => params.id as string)

const contractSkipFile = ref<UploadFile | null>()

const handleUploadFile = (file: UploadFile) => {
  contractSkipFile.value = file
}

const handleRemoveFile = () => {
  contractSkipFile.value = null
}

const initiateContractSkipButtonDisabled = computed(
  () => !contractSkipFile.value || (selectedLocations.value?.length ?? 0) <= 0 || props.isSubmitting,
)

const { t } = useI18n()

const locationStore = useLocationStore()

const locationsMap: Ref<Record<string, ILocation>> = ref({})

watch(
  () => [props.locations, locationsMap],
  () => {
    possibleLocations.value = [...props.locations.map((locId) => locationsMap.value[locId])]
  },
  { deep: true },
)

const possibleLocations: Ref<ILocation[]> = ref([])

const selectedLocations = ref<string[]>([])

onMounted(async () => {
  const locMap = await locationStore.getLocationLookupMap()
  locationsMap.value = locMap

  selectedLocations.value = [...props.locations]
})

const { showErrorMessage } = useNotifications()
const { uploadsForType } = useUpload(proposalId, [UseCaseUpload.SkipContract], showErrorMessage)

const initiateSkipContract = () => {
  if (contractSkipFile.value) {
    emit('initiateContractSkip', selectedLocations.value, contractSkipFile.value.raw)
  }
}

// for testing
defineExpose({
  contractSkipFile,
  initiateContractSkipButtonDisabled,
  selectedLocations,
  isSubmitting: props.isSubmitting,
})
</script>
