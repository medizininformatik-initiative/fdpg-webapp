<template>
  <Menu v-slot="{ open }" as="div" class="menu">
    <MenuButton class="menu-button">
      <img v-if="button.kind === 'img'" :src="button.src" aria-hidden="true" alt="" width="16" height="16" />
      <span v-if="button.kind === 'icon'" class="icon" :class="button.iconClass" aria-hidden="true" />
      <template v-if="button.isTranslatable">{{ $t(button.label) }}</template>
      <template v-else>{{ button.label }}</template>

      <span
        v-if="showDropdownIcon"
        class="caret-icon fa fa-caret-down"
        :class="open && 'caret-icon--open'"
        aria-hidden="true"
      />
    </MenuButton>
    <MenuItems class="menu-items">
      <MenuItem v-for="item in items" :key="item.label" v-slot="{ active }" class="menu-item" as="template">
        <span :class="active && 'menu-item--active'" @click="item.action">
          <img
            v-if="item.kind === 'img'"
            :src="item.src"
            aria-hidden="true"
            alt=""
            width="16"
            height="16"
            style="margin-right: 5px"
          />
          <span v-if="item.kind === 'icon'" class="icon" :class="item.iconClass" aria-hidden="true" />
          {{ $t(item.label) }}</span
        >
      </MenuItem>
    </MenuItems>
  </Menu>
</template>

<script setup lang="ts">
import type { DropdownButton, DropdownItem } from '@/types/dropdown.types'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import type { PropType } from 'vue'

defineProps({
  showDropdownIcon: {
    type: Boolean,
    required: false,
  },
  button: {
    type: Object as PropType<DropdownButton>,
    required: true,
  },
  items: {
    type: Array as PropType<DropdownItem[]>,
    required: true,
  },
})
</script>

<style scoped lang="scss">
@import 'src/assets/sass/variable';

.menu {
  display: inline-block;
  position: relative;
  text-align: left;
  z-index: 10;
}

.menu-button {
  display: inline-flex;
  padding: 0.5rem 1rem;
  color: var(--el-text-color-regular);
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: bold;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  border: none;
  background: none;
  cursor: pointer;
}

.caret-icon {
  transition: all 0.2s;

  &--open {
    transform: rotate(180deg);
  }
}

.menu-items {
  position: absolute;
  right: 0;
  margin-top: 0.1rem;
  background-color: $white;
  transform-origin: top right;
  width: fit-content;
  border-radius: var(--el-popover-border-radius, 4px);
  border: 1px solid var(--el-border-color-light);
  box-shadow: 0 2px 11px 0 $gray-500;
}

.menu-item {
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  align-items: center;
  min-width: fit-content;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  white-space: nowrap;
  cursor: pointer;

  &--active {
    background-color: #ecf5ff;
    color: #66b1ff;
  }

  .icon {
    width: 1rem;
  }
}
</style>
