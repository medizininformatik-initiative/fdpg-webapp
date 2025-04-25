<template>
  <div class="data-source-list-drawer-container">
    <transition name="fade">
      <div class="data-source-list-drawer-mask" v-if="isOpen" @click="closeDrawer" aria-hidden="true"></div>
    </transition>
    <div
      class="data-source-list-drawer"
      :class="{ 'is-open': isOpen }"
      role="dialog"
      aria-labelledby="data-sources-title"
      :aria-hidden="!isOpen"
    >
      <div class="data-source-list-drawer-header">
        <FdpgLabel id="data-sources-title" size="medium">{{ t('sidebar.DataSources') }}</FdpgLabel>
        <el-button type="text" @click="closeDrawer" aria-label="Close">
          <i class="el-icon-close"></i>
        </el-button>
      </div>
      <div class="data-source-list-drawer-content">
        <el-collapse v-if="selectedSources.length > 0">
          <el-collapse-item
            v-for="item in selectedSources"
            :key="item._id"
            class="data-source-list-drawer-content-item"
          >
            <template #title>
              <div class="header">
                <div class="data-source-header">
                  <h5 class="identifier">{{ item.tag }}</h5>
                </div>
                <div class="data-source-title">
                  <FdpgLabel size="small" :html-for="item.title"> {{ t(item.title) }} </FdpgLabel>
                  <el-button
                    type="primary"
                    link
                    @click.stop="removeSource(item)"
                    aria-label="Remove source"
                    data-testId="remove-source"
                  >
                    <i class="fa-solid fa-trash"></i>
                  </el-button>
                </div>
              </div>
            </template>

            <div>
              <p>{{ t(item.description) }}</p>
              <div class="data-source-footer">
                <el-button
                  type="primary"
                  class="info-link"
                  @click="goToStep(CreatPrposalSteps.Variables)"
                  aria-label="Go to select variable"
                >
                  <i class="fa-solid fa-plus"></i>
                  {{ t('proposal.toSelectVariable') }}
                </el-button>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
        <div v-else class="empty-state">
          {{ t('proposal.noDataSourcesSelected') }}
        </div>
      </div>
      <div class="data-source-list-drawer-footer">
        <el-button type="primary" @click="nextStep" aria-label="Go to Next Step">
          {{ t('proposal.nextStep') }}
        </el-button>
        <el-button plain @click="goToStep(CreatPrposalSteps.DataSources)" aria-label="Continue with data source">
          {{ t('proposal.continueWithDataSource') }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import FdpgLabel from '@/components/FdpgLabel.vue'
import { useLayoutStore } from '@/stores/layout.store'
import { CreatPrposalSteps } from '@/types/create-proposal-steps.enum'
import type { IDataSource } from '@/types/proposal.types'
import { useVModel } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import { computed, onMounted, ref } from 'vue'
import type { PropType } from 'vue'

const { t } = useI18n()

const props = defineProps({
  modelValue: {
    type: Array as PropType<IDataSource[]>,
    required: true,
    default: () => [],
  },
})
const emit = defineEmits(['update:modelValue'])
const selectedSources = useVModel(props, 'modelValue', emit)

const layoutStore = useLayoutStore()
const isOpen = computed(() => layoutStore.isShoppingListOpen)

const removeSource = (item: IDataSource) => {
  const index = selectedSources.value.findIndex((source) => source._id === item._id)
  if (index !== -1) {
    selectedSources.value.splice(index, 1)
  }
}

const goToStep = (CreatPrposalSteps: CreatPrposalSteps) => {
  layoutStore.goToStep(CreatPrposalSteps)
  layoutStore.toggleShoppingList()
}

const nextStep = () => {
  layoutStore.nextStep()
  layoutStore.toggleShoppingList()
}

onMounted(() => {
  if (layoutStore.isShoppingListOpen) {
    layoutStore.toggleShoppingList()
  }
})

const closeDrawer = () => {
  layoutStore.toggleShoppingList()
}
</script>

<style lang="scss" scoped>
@use '@/assets/sass/variable' as *;

// Container
.data-source-list-drawer-container {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 10;
  pointer-events: none;
}

// Mask overlay
.data-source-list-drawer-mask {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.5);
  pointer-events: auto;
}

// Drawer component
.data-source-list-drawer {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 0;
  max-width: 90%;
  background-color: #fff;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  z-index: 101;
  transition: width 0.5s ease-in-out;
  overflow: hidden;
  pointer-events: auto;

  &.is-open {
    width: 90%;
  }

  &-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    min-width: 300px;
  }

  &-content {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    min-width: 300px;

    .empty-state {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100px;
      color: $blue;
    }
  }
  &-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    min-width: 300px;
  }
}

// Content items
.data-source-list-drawer-content-item {
  .header {
    display: flex;
    flex-direction: column;
    width: 95%;
  }

  .data-source {
    &-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;

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

    &-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;

      .el-button {
        padding: 0;
        font-size: 14px;
        color: $blue;
        text-decoration: underline;
        cursor: pointer;

        &:hover {
          text-decoration: none;
        }
      }
    }
  }

  .data-source-footer {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 15px;
  }
}

// Transitions
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
