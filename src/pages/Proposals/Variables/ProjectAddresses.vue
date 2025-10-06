<template>
  <FdpgLabel html-for="proposal.addressees" size="medium" />
  <el-card class="form-group">
    <FdpgFormItem prop="userProject.addressees.desiredLocations">
      <FdpgLabel info="proposal.desiredLocationsInfo" html-for="proposal.desiredLocations" />
      <LocationSelect
        v-model="addresseesForm.desiredLocations"
        :disabled="reviewMode || addresseesForm.isDone"
        testIdExtension="__addresseesForm.desiredLocations"
        placeholder="proposal.pleaseSelectYourLocations"
        :minimumSelection="minimumSelection"
        allOptionLabel="proposal.virtualAllLocations"
        style="width: 100%"
        :closable="false"
        :all-locations="allLocations"
      />
    </FdpgFormItem>
  </el-card>

  <TaskViewer :object-id="addresseesForm._id" />
</template>

<script setup lang="ts">
import FdpgFormItem from '@/components/FdpgFormItem.vue'
import FdpgLabel from '@/components/FdpgLabel.vue'
import FdpgSelect from '@/components/FdpgSelect.vue'
import LocationSelect from '@/components/LocationSelect.vue'
import { MII_LOCATIONS, SORTED_ACTIVE_LOCATION_OPTIONS } from '@/constants'
import { MiiLocation } from '@/types/location.enum'
import type { ILocation } from '@/types/location.types'
import type { IAddressees } from '@/types/proposal.types'
import { useVModel } from '@vueuse/core'
import type { PropType } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object as PropType<IAddressees>,
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
})

const minimumSelection: MiiLocation[] = [] // [MiiLocation.VirtualAll]

const emit = defineEmits(['update:modelValue'])

const addresseesForm = useVModel(props, 'modelValue', emit)
</script>
