<template>
  <table class="checklist-table">
    <tbody>
      <!-- Parent Rows -->

      <template v-for="(row, rowIndex) in tableData" :key="row._id">
        <tr>
          <td>{{ $t(`proposal.${row.questionKey}`) }}</td>

          <td>
            <el-radio-group
              v-model="row.answer[0]"
              @change="handleOptionChange(row)"
              v-if="row.isMultiple === false"
              :disabled="isDisabled"
              class="el-radio-group"
            >
              <FdpgRadio
                v-for="(option, index) in row.options"
                :key="index"
                :label="`proposal.${option.optionValue}`"
                :value="option.optionValue"
                size="small"
              ></FdpgRadio>
            </el-radio-group>
            <el-checkbox-group v-model="row.answer" v-else @change="handleOptionChange(row)" :disabled="isDisabled">
              <FdpgCheckbox
                v-for="(option, index) in row.options"
                :key="index"
                :label="`proposal.${option.optionValue}`"
                :value="option.optionValue"
                :size="FdpgInputSize.Small"
              ></FdpgCheckbox>
            </el-checkbox-group>
          </td>

          <td>
            <FdpgTextEditor
              v-model="row.comment"
              @blur="handleOptionChange(row)"
              @input="debouncedHandleOptionChange(row)"
              :disabled="isDisabled"
            ></FdpgTextEditor>
          </td>
        </tr>

        <tr v-if="row.answer[0] === 'yes' && row.sublist?.length" :key="`sublist-${row._id}`">
          <td colspan="3">
            <table class="checklist-table sublist">
              <tbody>
                <!-- Use sublist items directly -->

                <tr v-for="subItem in row.sublist" :key="subItem._id">
                  <td>{{ $t(`proposal.${subItem.questionKey}`) }}</td>

                  <td>
                    <el-radio-group
                      v-model="subItem.answer[0]"
                      v-if="subItem.isMultiple === false"
                      @change="handleOptionChange(row)"
                      :disabled="isDisabled"
                    >
                      <FdpgRadio
                        v-for="(option, index) in subItem.options"
                        :key="index"
                        :label="`proposal.${option.optionValue}`"
                        :value="option.optionValue"
                        :size="FdpgInputSize.Small"
                      ></FdpgRadio>
                    </el-radio-group>
                    <el-checkbox-group
                      v-model="subItem.answer"
                      v-else
                      @change="handleOptionChange(row)"
                      :disabled="isDisabled"
                    >
                      <FdpgCheckbox
                        v-for="(option, index) in subItem.options"
                        :key="index"
                        :label="`proposal.${option.optionValue}`"
                        :value="option.optionValue"
                        :size="FdpgInputSize.Small"
                      ></FdpgCheckbox>
                    </el-checkbox-group>
                  </td>

                  <td>
                    <FdpgTextEditor
                      v-model="subItem.comment"
                      @blur="handleOptionChange(row)"
                      @input="debouncedHandleOptionChange(row)"
                      :disabled="isDisabled"
                    ></FdpgTextEditor>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </template>

      <!-- Sublist Rows (linked to parent by the same row data) -->
    </tbody>
  </table>
</template>

<script setup>
import FdpgTextEditor from './FdpgTextEditor.vue'
import FdpgRadio from './FdpgRadio.vue'
import { FdpgInputSize } from '@/types/component.types'
import FdpgCheckbox from './FdpgCheckbox.vue'
import { defineProps, defineEmits } from 'vue'
import { debounce } from 'lodash-es'

const props = defineProps({
  tableData: {
    type: Array,
    required: true,
  },

  isDisabled: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits(['update:listItem'])

const debouncedHandleOptionChange = debounce((row) => {
  handleOptionChange(row)
}, 500)

const haveActualText = (htmlContent) => {
  const strippedContent = htmlContent.replace(/<[^>]*>/g, '').trim()

  return strippedContent.length > 0
}

const handleOptionChange = (row) => {
  const item = { ...row }

  if (row.answer.length) {
    item.isAnswered = true
  } else if (!row.options.length && haveActualText(row.comment)) {
    item.isAnswered = true
  } else if (!row.options.length && !haveActualText(row.comment)) {
    item.isAnswered = false
  } else {
    item.isAnswered = false
  }

  emit('update:listItem', item)
}
</script>

<style lang="scss">
@use '@/assets/sass/variable' as *;

.checklist-table {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
  font-size: 14px;
  table-layout: fixed;
  max-width: 100%;
}

.checklist-table th,
.checklist-table td {
  border-bottom: 1px solid #ccc;
  padding: 0.5em 1em;
  text-overflow: ellipsis;
  .el-checkbox-group {
    display: flex;
    flex-direction: column;
  }
  .el-radio-group {
    display: flex;
  }
}

.checklist-table th {
  background: #f4f4f4;
  text-align: left;
}

.checklist-table td {
  word-wrap: break-word;
}

.checklist-table td:nth-child(1),
.checklist-table th:nth-child(1) {
  min-width: 4cm;
}

.checklist-table td:nth-child(2),
.checklist-table th:nth-child(2) {
  min-width: 20%;
}

.checklist-table td:nth-child(3),
.checklist-table th:nth-child(3) {
  min-width: 40%;
}

.sublist {
  margin-left: 2em;
  tr:last-child {
    td {
      border-bottom: none;
    }
  }
}

/* Responsive design adjustments */
@media (max-width: 768px) {
  .checklist-table {
    font-size: 12px;
  }

  .checklist-table td,
  .checklist-table th {
    padding: 0.3em;
  }

  /* Adjust column widths on smaller screens */
  .checklist-table td:nth-child(1),
  .checklist-table th:nth-child(1) {
    min-width: 20%;
  }

  .checklist-table td:nth-child(2),
  .checklist-table th:nth-child(2) {
    min-width: 40%;
  }

  .checklist-table td:nth-child(3),
  .checklist-table th:nth-child(3) {
    min-width: 40%;
  }
}
</style>
