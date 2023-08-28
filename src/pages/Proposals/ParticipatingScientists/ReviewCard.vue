<template>
  <template v-if="dto[card.key]">
    <ReviewLabel
      :is-done="dto[card.key].isDone"
      class="form-label-mt-4"
      :title="card.cardLabel ?? headlineOverwrite"
      :section-id="dto[card.key]._id"
      :headline="headline"
    />

    <template v-if="card.loopOn">
      <DefinitionCard
        v-for="(item, itemIdx) in dto[card.key][card.loopOn]"
        :key="itemIdx + 'item' + item._id"
        :card="card"
        :dto="item"
      ></DefinitionCard>
    </template>
    <DefinitionCard v-else :card="card" :dto="dto"></DefinitionCard>

    <FdpgCommentCreator
      v-if="authStore.singleKnownRole === Role.FdpgMember && !isDraft"
      :object-id="dto[card.key]._id"
      :type="CommentType.PROPOSAL_TASK"
    />
    <div v-else class="fdpg-section-spacer"></div>
  </template>
</template>

<script setup lang="ts">
import ReviewLabel from '@/components/ReviewLabel.vue'
import type { DefinitionCards, DefinitionCardsVirtual } from '@/components/Shared/definition-card.types'
import DefinitionCard from '@/components/Shared/DefinitionCard.vue'
import { useAuthStore } from '@/stores/auth/auth.store'
import { CommentType } from '@/types/comment.interface'
import { Role } from '@/types/oidc.types'
import type { PropType } from 'vue';
import { defineAsyncComponent } from 'vue'

const FdpgCommentCreator = defineAsyncComponent(() => import('@/components/FdpgCommentCreator.vue'))

defineProps({
  dto: {
    type: Object as PropType<any>,
    required: true,
  },
  card: {
    type: Object as PropType<DefinitionCards<any, any> | DefinitionCardsVirtual<any, any>>,
    required: true,
  },
  isDone: {
    type: Boolean,
    default: false,
  },
  headline: {
    type: String,
    default: 'h3',
  },
  headlineOverwrite: {
    type: String,
    default: undefined,
  },
  isDraft: {
    type: Boolean,
    required: true
  }
})

const authStore = useAuthStore()
</script>

<style lang="scss" scoped>
.fdpg-section-spacer {
  margin-bottom: 3em;
}
</style>
