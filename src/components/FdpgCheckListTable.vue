<template>
  <table class="checklist-table">
    <tbody>
      <!-- Parent Rows -->

      <template v-for="(row, rowIndex) in tableData" :key="row._id">
        <tr>
          <td>{{ $t(`proposal.${row.questionKey}`) }}</td>

          <td>
            <el-radio-group v-model="row.answer[0]" @change="handleOptionChange(row)" v-if="row.isMultiple === false">
              <FdpgRadio
                v-for="(option, index) in row.options"
                :key="index"
                :label="`proposal.${option.optionValue}`"
                :value="option.optionValue"
                :size="FdpgInputSize.Small"
              ></FdpgRadio>
            </el-radio-group>
            <el-checkbox-group v-model="row.answer" v-else @change="handleOptionChange(row)">
              <FdpgCheckbox
                v-for="(option, index) in row.options"
                :key="index"
                :label="`proposal.${option.optionValue}`"
                :value="option.optionValue"
                :size="FdpgInputSize.Small"
              ></FdpgCheckbox>
            </el-checkbox-group>
          </td>

          <td width="100%">
            <FdpgTextEditor v-model="row.comment" @blur="handleOptionChange(row)"></FdpgTextEditor>
          </td>
        </tr>

        <tr v-if="row.answer[0] === 'yes' && row.sublist?.length" :key="`sublist-${row._id}`">
          <td colspan="3">
            <table class="sub-table">
              <tbody>
                <!-- Use sublist items directly -->

                <tr v-for="subItem in row.sublist" :key="subItem._id">
                  <td>{{ $t(`proposal.${subItem.questionKey}`) }}</td>

                  <td>
                    <el-radio-group v-model="subItem.answer[0]" v-if="subItem.isMultiple === false">
                      <FdpgRadio
                        v-for="(option, index) in subItem.options"
                        :key="index"
                        :label="`proposal.${option.optionValue}`"
                        :value="option.optionValue"
                        :size="FdpgInputSize.Small"
                      ></FdpgRadio>
                    </el-radio-group>
                    <el-checkbox-group v-model="subItem.answer" v-else>
                      <FdpgCheckbox
                        v-for="(option, index) in subItem.options"
                        :key="index"
                        :label="`proposal.${option.optionValue}`"
                        :value="option.optionValue"
                        :size="FdpgInputSize.Small"
                      ></FdpgCheckbox>
                    </el-checkbox-group>
                  </td>

                  <td><FdpgTextEditor v-model="subItem.comment"></FdpgTextEditor></td>
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
const props = defineProps({
  tableData: {
    type: Array,
    required: true,
  },
})
const emit = defineEmits(['update:listItem'])

const handleOptionChange = (row) => {
  emit('update:listItem', row)
}
</script>

<style lang="scss">
@use '@/assets/sass/variable' as *;
.checklist-table {
  border-collapse: collapse;

  width: 100%;

  margin: 1em 0;
  font-size: 14px;
}
.checklist-table th,
.checklist-table td {
  border-bottom: 1px solid #ccc;

  padding: 0.5em;
}

.checklist-table th {
  background: #f4f4f4;

  text-align: left;
}
</style>
