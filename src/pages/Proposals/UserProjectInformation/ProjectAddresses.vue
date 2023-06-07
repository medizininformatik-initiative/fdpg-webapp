<template>
  <FdpgLabel html-for="proposal.addressees" size="medium" />
  <el-card class="form-group">
    <FdpgFormItem prop="userProject.addressees.desiredLocations">
      <FdpgLabel info="proposal.desiredLocationsInfo" html-for="proposal.desiredLocations" />
      <FdpgSelect
        v-model="addresseesForm.desiredLocations"
        data-testId="addresseesForm.desiredLocations"
        test-id-extension="__addresseesForm.desiredLocations"
        multiple
        placeholder="proposal.pleaseSelectYourLocations"
        :options="locationOptions"
        :disabled="reviewMode || addresseesForm.isDone"
      />
    </FdpgFormItem>
  </el-card>
</template>

<script setup lang="ts">
import FdpgFormItem from '@/components/FdpgFormItem.vue'
import FdpgLabel from '@/components/FdpgLabel.vue'
import FdpgSelect from '@/components/FdpgSelect.vue'
import { MII_LOCATIONS, SORTED_ACTIVE_LOCATION_OPTIONS } from '@/constants'
import { MiiLocation } from '@/types/location.enum'
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
})

const locationOptions = [
  {
    label: MII_LOCATIONS.VIRTUAL_ALL.display,
    value: MiiLocation.VirtualAll,
  },
  ...SORTED_ACTIVE_LOCATION_OPTIONS,
]
const emit = defineEmits(['update:modelValue'])

const addresseesForm = useVModel(props, 'modelValue', emit)
</script>
