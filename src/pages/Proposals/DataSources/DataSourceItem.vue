<template>
  <div class="data-source-item" :class="{ 'is-selected': isSelected }">
    <el-card class="data-source-card">
      <div class="data-source">
        <div class="data-source-header">
          <h5 class="identifier">{{ platformIdentifier }}</h5>
        </div>
        <FdpgLabel :htmlFor="dataSource.title" size="medium" />
        <p v-if="dataSource.description">{{ $t(dataSource.description) }}</p>
        <a v-if="dataSource.externalLink" :href="$t(dataSource.externalLink)" target="_blank" class="info-link"
          >More info</a
        >

        <div class="data-source-footer">
          <el-button
            type="primary"
            class="action-button"
            @click="addSelection(platformIdentifier)"
            :disabled="isSelected"
          >
            <i class="fa-solid fa-plus"></i> {{ $t('proposal.addDataSource') }}
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import FdpgLabel from '@/components/FdpgLabel.vue'
import { PlatformIdentifier } from '@/types/platform-identifier.enum'
import type { IDataSource } from '@/types/proposal.types'

const props = defineProps({
  dataSource: {
    type: Object as () => IDataSource,
    required: true,
  },
  isSelected: {
    type: Boolean,
    default: false,
  },
  platformIdentifier: {
    type: String as () => PlatformIdentifier,
    required: true,
  },
})

const emit = defineEmits(['change'])

const addSelection = (dataSource: PlatformIdentifier) => {
  emit('change', dataSource)
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
  &-header {
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
