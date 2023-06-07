<template>
  <router-link
    class="fdpg-menu__item"
    active-class="fdpg-menu__item--active"
    exact-active-class="fdpg-menu__item--exact-active"
    :to="{ name: menu.to }"
  >
    <div class="fdpg-menu__wrapper">
      <i v-if="menu.icon" :class="menu.icon" aria-hidden="true" />
      {{ $t(menu.title) }}
    </div>
    <div class="fdpg-menu__icons">
      <span v-if="proposalCount.critical > 0" class="fdpg-menu__icon fdpg-menu__icon--critical">{{
        proposalCount.critical
      }}</span>
      <span v-if="proposalCount.high > 0" class="fdpg-menu__icon fdpg-menu__icon--high">{{ proposalCount.high }}</span>
      <span v-if="proposalCount.low > 0" class="fdpg-menu__icon fdpg-menu__icon--low">{{ proposalCount.low }}</span>
    </div>
  </router-link>
</template>

<script setup lang="ts">
import usePanels from '@/composables/use-panels'
import type { SidebarRouteMenu } from '@/types/sidebar-menu.types'
import type { PropType } from 'vue';
import { computed } from 'vue'

const props = defineProps({
  menu: {
    type: Object as PropType<SidebarRouteMenu>,
    required: true,
  },
})

const routeName = computed(() => props.menu.to)
const { proposalCount } = usePanels(routeName)
</script>
