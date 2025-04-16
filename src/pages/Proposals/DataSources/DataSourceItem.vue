<template>
  <div>
    <el-card class="data-source-card">
      <div class="data-source">
        <div class="data-source-header">
          <h5 class="identifier">{{ dataSource.id }}</h5>
        </div>
        <FdpgLabel :htmlFor="dataSource.title" :required="true" size="medium" />
        <p>{{ $t(dataSource.description) }}</p>
        <a :href="$t(dataSource.externalLink)" target="_blank">More Info</a>
        <div class="data-source-footer">
          <el-button type="primary" @click="$emit('select', dataSource)" class="add-data-source-btn">
            <i class="bi bi-plus"></i>
            Select
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import FdpgLabel from '@/components/FdpgLabel.vue'

const props = defineProps({
  dataSource: {
    type: Object,
    required: true,
  },
  isSelected: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits(['select', 'deselect'])
</script>

<style scoped lang="scss">
@use '@/assets/sass/variable' as *;
.data-source-card {
  margin: 20px 0;
  padding: 20px;
}
.data-source {
  .data-source-header {
    display: flex;
    justify-content: space-between;
    position: relative;
    margin-bottom: 10px;
    .identifier {
      margin: 0;
      color: $white;
      font-size: 12px;
      padding: 0 12px;
      font-weight: 400;
      line-height: 20px;
      border-radius: 5px;
      background-color: $blue;
    }
  }
  .data-source-footer {
    display: flex;
    justify-content: end;
    align-items: center;
    margin-top: 10px;
    .data-source-tag {
      margin-right: 10px;
    }
    .add-data-source-btn {
      i {
        font-size: 2rem;
      }
    }
  }
}
</style>
