<template>
  <FdpgLabel html-for="proposal.projectResourcesAndRecontact" size="medium" />
  <el-card class="form-group">
    <FdpgFormItem>
      <FdpgLabel
        html-for="proposal.areSufficientProfessionalAndFinancialResourcesAvailable"
        info="proposal.areSufficientProfessionalAndFinancialResourcesAvailableInfo"
      />
      <el-radio-group
        v-model="resourceAndRecontactForm.hasEnoughResources"
        data-testId="resourceAndRecontactForm.hasEnoughResources"
        class="el-radio-group-mt-12"
        :disabled="reviewMode || resourceAndRecontactForm.isDone"
      >
        <FdpgRadio
          label="proposal.yes"
          :value="true"
          test-id-extension="__resourceAndRecontactForm.hasEnoughResources"
        />
        <FdpgRadio
          label="proposal.no"
          :value="false"
          test-id-extension="__resourceAndRecontactForm.hasEnoughResources"
        />
      </el-radio-group>
    </FdpgFormItem>

    <p class="description">
      {{ $t('proposal.expenseAllowancesHint') }}
    </p>

    <FdpgFormItem>
      <FdpgLabel html-for="proposal.additionalDataCollection" />
      <el-radio-group
        v-model="resourceAndRecontactForm.isRecontactingIntended"
        data-testId="resourceAndRecontactForm.isRecontactingIntended"
        class="el-radio-group-mt-12"
        :disabled="reviewMode || resourceAndRecontactForm.isDone"
      >
        <FdpgRadio
          label="proposal.yes"
          :value="true"
          test-id-extension="__resourceAndRecontactForm.isRecontactingIntended"
        />
        <FdpgRadio
          label="proposal.no"
          :value="false"
          test-id-extension="__resourceAndRecontactForm.isRecontactingIntended"
        />
      </el-radio-group>
    </FdpgFormItem>
  </el-card>

  <TaskViewer :object-id="resourceAndRecontactForm._id" />
</template>

<script setup lang="ts">
import FdpgFormItem from '@/components/FdpgFormItem.vue'
import FdpgLabel from '@/components/FdpgLabel.vue'
import FdpgRadio from '@/components/FdpgRadio.vue'
import type { IResourceAndRecontact } from '@/types/proposal.types'
import { useVModel } from '@vueuse/core'
import type { PropType } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object as PropType<IResourceAndRecontact>,
    required: true,
  },

  reviewMode: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const resourceAndRecontactForm = useVModel(props, 'modelValue', emit)
</script>
