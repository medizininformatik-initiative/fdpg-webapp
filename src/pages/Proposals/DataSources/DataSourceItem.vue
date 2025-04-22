<template>
  <div class="data-source-item" :class="{ 'is-selected': isSelected }">
    <el-card class="data-source-card">
      <div class="data-source">
        <div class="data-source-header">
          <h5 class="identifier">{{ dataSource.tag }}</h5>
        </div>
        <FdpgLabel :htmlFor="dataSource.title" size="medium" />
        <p>{{ $t(dataSource.description) }}</p>
        <a :href="$t(dataSource.externalLink)" target="_blank" class="info-link">More info</a>

        <div class="data-source-footer">
          <el-button type="primary" class="action-button" @click="addSelection">
            <i class="bi bi-plus"></i>
            Data Source
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

const emit = defineEmits(['change'])

const addSelection = () => {
  const dataSourceCopy = JSON.parse(JSON.stringify(props.dataSource))

  if (!dataSourceCopy._id) {
    console.warn('DataSource is missing _id property, which could cause issues with selection')
    return
  }

  if (typeof dataSourceCopy._id !== 'string') {
    dataSourceCopy._id = String(dataSourceCopy._id)
  }

  emit('change', {
    dataSource: dataSourceCopy,
  })
}
</script>

<style scoped lang="scss">
@use '@/assets/sass/variable' as *;

.data-source-item {
  margin-bottom: 20px;
  transition: transform 0.2s;
}

.data-source-card {
  padding: 20px;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.data-source {
  .data-source-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
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
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;

    .action-button {
      i {
        margin-right: 5px;
      }
    }
  }

  .info-link {
    display: inline-block;
    margin-top: 10px;
  }
}
</style>
