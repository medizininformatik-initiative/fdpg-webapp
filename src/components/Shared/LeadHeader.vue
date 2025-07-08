<template>
  <div class="lead">
    <h1 class="title">{{ t('proposal.mIIUsageApplicationForm') }}</h1>
    <div class="button-spacer"></div>
  </div>
  <div class="button-container" v-if="proposalId">
    <el-button type="primary" size="large" @click="openDetails" data-testId="button__projectDetails">{{
      t('proposal.projectDetails')
    }}</el-button>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { RouteName } from '@/types/route-name.enum'
import { computed } from 'vue'

const router = useRouter()
const params = useRoute().params
const proposalId = computed(() => params.id as string)

const { t } = useI18n()

const openDetails = () => {
  if (proposalId.value) {
    router.push({
      name: RouteName.ProposalDetails,
      params: { id: params.id },
    })
  }
}
</script>

<style scoped>
.lead {
  margin-bottom: 37px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;

  .title {
    margin: 0;
    font-size: 32px;
  }

  .button-spacer {
    width: 200px;
    height: 40px;
  }
}

.button-container {
  position: sticky;
  top: 10px;
  z-index: 2;
  display: flex;
  justify-content: flex-end;
  margin-top: -60px;
  margin-bottom: 20px;
}
</style>
