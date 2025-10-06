<template>
  <FdpgDialog
    v-model="dialogOpen"
    class="initiate-contract-dialog"
    width="50%"
    :title="$t('proposal.toContractingModalTitle')"
    :before-close="closeDialog"
    :show-close="false"
  >
    <div>
      <p>{{ $t('proposal.toContractingModalDescription') }}</p>
      <div v-if="contractDraft" class="fdpg-upload-list-item">
        <p class="fdpg-upload-file__name">{{ contractDraft.name }}</p>
        <span>({{ (contractDraft.size / 1024).toFixed(1) }}KB)</span>
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
        <el-button v-if="!contractDraft" class="upload-button" link>
          {{ $t('proposal.chooseAFile') }}
          <template #icon>
            <el-icon class="bi-paperclip"></el-icon>
          </template>
        </el-button>
      </FdpgUpload>
    </div>
    <div>
      <FdpgLabel html-for="general.locations" />
      <FdpgSelect
        v-model="selectedLocations"
        multiple
        filterable
        data-testId="checkboxgroup__initiateContract.selecteLocations"
        test-id-extension="__checkboxgroup__initiateContract.selecteLocations"
        placeholder="proposal.pleaseSelectYourLocations"
        :options="locationOptions"
        shouldDisplayCheckAll
      />
    </div>
    <template #footer>
      <span>
        <el-button link data-testId="button__closeInitiateContractDialog" @click="closeDialog">
          {{ t('general.cancel') }}
        </el-button>
        <el-button
          type="primary"
          :disabled="!contractDraft || !selectedLocations?.length || isSubmitting"
          data-testid="button__initiateContract"
          @click="initiateContract"
        >
          {{ t('proposal.initiateContract') }}
        </el-button>
      </span>
    </template>
  </FdpgDialog>
</template>

<script setup lang="ts">
import type { UploadFile } from 'element-plus'
import { computed, onMounted, ref, watchEffect, type PropType, type Ref } from 'vue'
import { useRoute } from 'vue-router'
import FdpgUpload from '@/components/FdpgUpload.vue'
import FdpgDialog from '@/components/FdpgDialog.vue'
import FdpgSelect from '@/components/FdpgSelect.vue'
import useNotifications from '@/composables/use-notifications'
import useUpload from '@/composables/use-upload'
import { UseCaseUpload } from '@/types/upload.types'
import { useVModel } from '@vueuse/core'
import { useLocationStore } from '@/stores/locations/location.store'
import type { ILocation } from '@/types/location.types'
import { useI18n } from 'vue-i18n'

const emit = defineEmits(['update:modelValue', 'closeDialog', 'initiateContract'])

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

const { t } = useI18n()

const dialogOpen = useVModel(props, 'modelValue', emit)
const closeDialog = () => {
  contractDraft.value = null
  dialogOpen.value = false
}

const { params } = useRoute()
const proposalId = computed(() => params.id as string)

const contractDraft = ref<UploadFile | null>()

const handleUploadFile = (file: UploadFile) => {
  contractDraft.value = file
}

const handleRemoveFile = () => {
  contractDraft.value = null
}

const locationStore = useLocationStore()

const locationsMap: Ref<Record<string, ILocation>> = ref({})

const locationOptions = computed(() => {
  return props.locations
    .map((id) => {
      const location = locationsMap.value[id]
      if (!location) {
        console.warn(`Missing location '${id}'`)
        return null
      }
      return { label: location.display, value: id }
    })
    .filter((entr) => entr)
})

const selectedLocations = ref<string[]>([])

onMounted(async () => {
  const locationsArray = await locationStore.getAll()
  locationsMap.value = Object.fromEntries(locationsArray.map((location) => [location._id, location]))
})

const { showErrorMessage } = useNotifications()
const { uploadsForType } = useUpload(proposalId, [UseCaseUpload.ContractDraft], showErrorMessage)

const initiateContract = () => {
  if (contractDraft.value) {
    emit('initiateContract', contractDraft.value, selectedLocations.value)
  }
}

watchEffect(() => (selectedLocations.value = props.locations))
</script>
