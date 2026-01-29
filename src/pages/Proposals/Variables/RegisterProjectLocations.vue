<template>
  <FdpgLabel html-for="registeringForm.registerLocations" size="medium" />
  <el-card class="form-group">
    <FdpgFormItem prop="registerInfo.locations">
      <FdpgLabel html-for="registeringForm.registerLocations" required />
      <LocationSelect
        v-model="registerInfoForm.locations"
        :disabled="reviewMode || registerInfoForm.isDone"
        testIdExtension="__registerInfoForm.locations"
        placeholder="proposal.pleaseSelectYourLocations"
        :minimumSelection="minimumSelection"
        style="width: 100%"
        :closable="false"
        :all-locations="allLocations"
      />
    </FdpgFormItem>
  </el-card>

  <TaskViewer :object-id="registerInfoForm._id" />
</template>

<script setup lang="ts">
import FdpgFormItem from '@/components/FdpgFormItem.vue'
import FdpgLabel from '@/components/FdpgLabel.vue'
import LocationSelect from '@/components/LocationSelect.vue'
import TaskViewer from '@/components/TaskViewer/TaskViewer.vue'
import type { ILocation } from '@/types/location.types'
import type { IRegisterInfo } from '@/types/proposal.types'
import { PlatformIdentifier } from '@/types/platform-identifier.enum'
import { useVModel } from '@vueuse/core'
import type { PropType } from 'vue'
import { watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object as PropType<IRegisterInfo>,
    required: true,
  },
  reviewMode: {
    type: Boolean,
    default: false,
  },
  allLocations: {
    type: Array as PropType<ILocation[]>,
    required: true,
  },
  selectedDataSources: {
    type: Array as PropType<PlatformIdentifier[]>,
    default: () => [],
  },
})

const minimumSelection: string[] = []

const emit = defineEmits(['update:modelValue'])

const registerInfoForm = useVModel(props, 'modelValue', emit)

watch(
  () => props.selectedDataSources,
  (newDataSources) => {
    if (newDataSources?.includes(PlatformIdentifier.DIFE)) {
      const difeLocation = props.allLocations.find((loc) => loc._id === 'DIFE')

      if (difeLocation && !registerInfoForm.value.locations?.includes('DIFE')) {
        if (!registerInfoForm.value.locations) {
          registerInfoForm.value.locations = []
        }
        registerInfoForm.value.locations.push('DIFE')
      }
    } else {
      if (registerInfoForm.value.locations) {
        registerInfoForm.value.locations = registerInfoForm.value.locations.filter((locId) => locId !== 'DIFE')
      }
    }
  },
  { immediate: true, deep: true },
)
</script>
