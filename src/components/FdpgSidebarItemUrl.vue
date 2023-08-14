<template>
  <div
    class="fdpg-menu__item"
    active-class="fdpg-menu__item--active"
    exact-active-class="fdpg-menu__item--exact-active"
  >
    <div class="fdpg-menu__wrapper">
      <i v-if="menu.icon" :class="menu.icon" aria-hidden="true" />
      <a class="fdpg-sidebar__url" :href="sanitizeUrl(menu.url)" rel="noopener" target="_blank">{{ $t(menu.title) }}</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SidebarUrlMenu } from '@/types/sidebar-menu.types'
import type { PropType } from 'vue'
import { sanitizeUrl } from '@braintree/sanitize-url'

defineProps({
  menu: {
    type: Object as PropType<SidebarUrlMenu>,
    required: true,
  },
})
</script>
