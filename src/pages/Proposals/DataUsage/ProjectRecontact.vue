<template>
  <FdpgLabel html-for="proposal.projectRecontact" size="medium" />
  <el-card class="form-group">
    <el-row>
      <el-col :sm="24">
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
      </el-col>
      <template v-if="resourceAndRecontactForm.isRecontactingIntended">
        <el-col :sm="24">
          <FdpgFormItem>
            <el-checkbox
              v-model="resourceAndRecontactForm.suppSurveyReContacting"
              class="fdpg-checkbox"
              size="small"
              :disabled="reviewMode || resourceAndRecontactForm.isDone"
            >
              {{ $t('proposal.suppSurveyReContacting') }}
            </el-checkbox>
          </FdpgFormItem>
          <FdpgFormItem>
            <FdpgLabel html-for="proposal.suppSurveyReContactingText" />

            <FdpgTextEditor
              v-model="resourceAndRecontactForm.suppSurveyReContactingText"
              data-testId="resourceAndRecontactForm.SuppSurveyReContact"
              :placeholder="$t('proposal.textPlaceholder')"
              :disabled="reviewMode || resourceAndRecontactForm.isDone"
              class="el-text-editor-mt-12"
            />
          </FdpgFormItem>
        </el-col>
        <el-col :sm="24">
          <FdpgFormItem>
            <el-checkbox
              v-model="resourceAndRecontactForm.reContactIncidental"
              class="fdpg-checkbox"
              size="small"
              :disabled="reviewMode || resourceAndRecontactForm.isDone"
            >
              {{ $t('proposal.reContactIncidental') }}
            </el-checkbox>
          </FdpgFormItem>
          <FdpgFormItem>
            <FdpgLabel html-for="proposal.reContactIncidentalText" />

            <FdpgTextEditor
              v-model="resourceAndRecontactForm.reContactIncidentalText"
              data-testId="resourceAndRecontactForm.suppSurveyReContact"
              :placeholder="$t('proposal.textPlaceholder')"
              :disabled="reviewMode || resourceAndRecontactForm.isDone"
              class="el-text-editor-mt-12"
            />
          </FdpgFormItem>
        </el-col>
        <el-col :sm="24">
          <FdpgFormItem>
            <el-checkbox
              v-model="resourceAndRecontactForm.urgentIncidentalReContacting"
              class="fdpg-checkbox"
              size="small"
              :disabled="reviewMode || resourceAndRecontactForm.isDone"
            >
              {{ $t('proposal.urgentIncidentalReContacting') }}
            </el-checkbox>
          </FdpgFormItem>

          <FdpgFormItem>
            <FdpgLabel html-for="proposal.urgentIncidentalReContactingText" />

            <FdpgTextEditor
              v-model="resourceAndRecontactForm.urgentIncidentalReContactingText"
              data-testId="resourceAndRecontactForm.SuppSurveyReContact"
              :placeholder="$t('proposal.textPlaceholder')"
              :disabled="reviewMode || resourceAndRecontactForm.isDone"
              class="el-text-editor-mt-12"
            />
          </FdpgFormItem>
        </el-col>
      </template>
    </el-row>
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
import FdpgTextEditor from '@/components/FdpgTextEditor.vue'
import { ElCard, ElCol, ElRow, ElCheckbox } from 'element-plus'
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
