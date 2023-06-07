<template>
  <section role="region">
    <h2 class="section-title">
      {{ $t('proposal.historyOfTheProject') }}
    </h2>
    <div class="project-history">
      <p v-for="({ date, label }, index) in historyList" :key="`history-item-${index}`" class="project-history__item">
        <span>{{ date }}</span>
        {{ label }}
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useProposalStore } from '@/stores/proposal/proposal.store'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const proposalStore = useProposalStore()
const projectHistory = computed(() => proposalStore.currentProposal?.history ?? [])

const historyList = computed(() => {
  return projectHistory.value.length > 0
    ? projectHistory.value.map((item) => ({
        date: item.createdAt
          ? new Date(item.createdAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            })
          : new Date().toLocaleDateString(),
        label: t(`history.${item.type}`),
      }))
    : []
})
</script>

<style lang="scss">
@import 'src/assets/sass/variable';

.project-history {
  .project-history__item {
    color: $black;
    display: flex;
    margin: 20px 0;
    font-weight: 500;

    span {
      display: block;
      color: $gray-900;
      margin-right: 31px;
    }
  }
}
</style>
