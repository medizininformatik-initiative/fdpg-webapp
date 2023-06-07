<template>
  <div class="fdpg-card-panel">
    <div class="header">
      <div class="title-wrapper">
        <h5 class="title">{{ $t(panel.header) }}{{ !loading ? ` (${proposals.length})` : '' }}</h5>
        <div v-loading="loading" />
      </div>
      <div class="action-wrapper">
        <el-button
          v-if="proposals.length > displayCount"
          type="text"
          class="alert-btn"
          @click="handleShowAllClick"
          @keydown.self.tab.shift="handleShiftTab($event)"
          >{{ $t('dashboard.showAll') }}</el-button
        >
        <el-button
          v-if="proposals.length > displayCount"
          type="text"
          class="alert-btn"
          @click="handleShowMoreClick"
          @keydown.self.tab.shift="handleShiftTab($event)"
          >{{ $t('dashboard.showMore') }}</el-button
        >
        <el-button
          v-if="displayCount > defaultLength"
          type="text"
          class="alert-btn"
          @click="handleShowLessClick"
          @keydown.self.tab.shift="handleShiftTab($event)"
          >{{ $t('dashboard.showLess') }}</el-button
        >
      </div>
    </div>
    <el-row
      :gutter="20"
      class="content"
      :tabindex="filteredProposals.length > 0 ? '0' : '-1'"
      @keydown.prevent.space="handleCardRowSpace($event.target, $event)"
      @keydown.prevent.esc="handleCardRowEsc($event.target)"
      @keydown.tab="handleTab($event)"
      @keydown.tab.shift="handleShiftTab($event)"
    >
      <el-col v-for="proposal in filteredProposals" :key="proposal._id" :lg="8" :md="12" :sm="24">
        <FdpgProposalCard
          :proposal="proposal"
          :type="panel.type"
          tabindex="0"
          @delete="handleDelete(proposal._id)"
          @duplicate="handleDuplicate(proposal._id)"
          @keydown.right="focusNextCard($event)"
          @keydown.left="focusPreviousCard($event)"
          @keydown.tab="handleTab($event)"
          @focus="handleFocus($event)"
        />
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import FdpgProposalCard from '@/components/FdpgProposalCardPanel/FdpgProposalCard/FdpgProposalCard.vue'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import type { PanelType } from '@/types/proposal.types'
import { SortDirection } from '@/types/sort-filter.types'
import useCardPanelAccessibility from '@/composables/use-card-panel-accessibility'
import type { PropType} from 'vue';
import { computed, onMounted, ref, watch } from 'vue'

const props = defineProps({
  panel: {
    type: Object as PropType<PanelType>,
    required: true,
  },
  defaultLength: {
    type: Number,
    required: false,
    default: 3,
  },
  sortBy: {
    type: String,
    required: false,
    default: null,
  },
  sortOrder: {
    type: String as PropType<SortDirection>,
    required: false,
    default: SortDirection.ASC,
  },
})

const displayCount = ref<number>(props.defaultLength)
const loading = ref<boolean>(false)

const proposalStore = useProposalStore()

const fetchProposals = async () => {
  displayCount.value = props.defaultLength
  try {
    loading.value = true
    await proposalStore.fetch({ sortBy: props.sortBy, order: props.sortOrder, panelQuery: props.panel.query })
    loading.value = false
  } catch (error) {
    loading.value = false
    console.log('TODO: Handle Error', error)
  }
}

const handleDelete = (id: string) => {
  try {
    proposalStore.deleteProposal(id, props.panel.query).then(fetchProposals)
  } catch (error) {
    console.log('TODO: Handle Error', error)
  }
}

const handleDuplicate = (id: string) => {
  try {
    proposalStore.duplicateProposal(id).then(fetchProposals)
  } catch (error) {
    console.log('TODO: Handle Error', error)
  }
}

const handleShowMoreClick = () => {
  displayCount.value +=
    proposals.value.length - displayCount.value >= props.defaultLength
      ? props.defaultLength
      : proposals.value.length % props.defaultLength
}

const handleShowLessClick = () => {
  displayCount.value = props.defaultLength
}

const handleShowAllClick = () => {
  displayCount.value = proposals.value.length
}

const {
  handleFocus,
  focusNextCard,
  focusPreviousCard,
  handleCardRowSpace,
  handleCardRowEsc,
  handleShiftTab,
  handleTab,
} = useCardPanelAccessibility()

onMounted(async () => {
  fetchProposals()
})

watch([props], () => {
  fetchProposals()
})

const filteredProposals = computed(() => proposals.value.slice(0, displayCount.value))
const proposals = computed(() => proposalStore.filteredProposal[props.panel.query] || [])
</script>

<style lang="scss" scoped>
@import 'src/assets/sass/variable';

.fdpg-card-panel {
  margin-bottom: 30px;
  min-height: 57px;
  border-radius: 8px;
  padding: 23px 20px 20px;
  background-color: $gray-200;

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .title-wrapper {
      display: flex;
      align-items: center;

      .title {
        margin: 0;
        font-size: 20px;
      }

      --el-loading-spinner-size: 30px;
      --el-loading-fullscreen-spinner-size: 32px;
    }

    .el-row {
      &:focus {
        outline: $blue auto 1px;
        outline-offset: 3px;
      }
    }

    .alert-btn {
      span {
        font-size: 14px;
        font-weight: 600;
      }
      &:focus-visible {
        outline: -webkit-focus-ring-color auto 1px;
      }
    }
  }

  .content {
    padding-top: 5px;
    margin-bottom: -20px;

    .el-col {
      margin-bottom: 20px;
    }
  }
}
</style>
