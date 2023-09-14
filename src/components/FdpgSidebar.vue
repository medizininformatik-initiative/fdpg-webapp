<template>
  <el-aside class="fdpg-sidebar" :class="{ block: layoutStore.isSidebarVisible }">
    <img :src="logoSrc" alt="" class="logo" />
    <div class="fdpg-menu">
      <div class="fdpg-menu__top">
        <template v-for="(menu, index) of mainMenu" :key="index">
          <FdpgSidebarItemRoute v-if="menu.kind === MenuType.Route" :menu="menu" />
          <FdpgSidebarItemUrl v-if="menu.kind === MenuType.Url" :menu="menu" />
        </template>
      </div>
      <div class="fdpg-menu__bottom">
        <el-divider />
        <template v-for="(menu, index) in secondaryMenu" :key="'secondaryMenu' + index">
          <FdpgSidebarItemRoute v-if="menu.kind === MenuType.Route" :menu="menu" />
          <FdpgSidebarItemUrl v-if="menu.kind === MenuType.Url" :menu="menu" />
        </template>
      </div>
    </div>
  </el-aside>
</template>

<script setup lang="ts">
import FdpgSidebarItemUrl from '@/components/FdpgSidebarItemUrl.vue'
import FdpgSidebarItemRoute from '@/components/FdpgSidebarItemRoute.vue'
import { useAuthStore } from '@/stores/auth/auth.store'
import { useLayoutStore } from '@/stores/layout.store'
import { Role } from '@/types/oidc.types'
import { RouteName } from '@/types/route-name.enum'
import type { SidebarMenu } from '@/types/sidebar-menu.types'
import { MenuType } from '@/types/sidebar-menu.types'
import type { ComputedRef } from 'vue'
import { computed } from 'vue'

const layoutStore = useLayoutStore()
const authStore = useAuthStore()
const logoSrc = new URL('@/assets/img/logo/logo.svg', import.meta.url).href



const mainMenu: ComputedRef<SidebarMenu[]> = computed(() => {
  return authStore.singleKnownRole ? mainMenuMap[authStore.singleKnownRole] : []
})

interface Menu {
  [key: string]: SidebarMenu[]
}

const mainMenuMap: Menu = {
  [Role.Admin]: [
    {
      kind: MenuType.Route,
      to: RouteName.Dashboard,
      title: 'sidebar.dashboard',
      icon: 'bi bi-folder-fill',
    },
    {
      kind: MenuType.Route,
      to: RouteName.Archive,
      title: 'general.archive',
      icon: 'bi bi-archive-fill',
    },
  ],
  [Role.FdpgMember]: [
    {
      kind: MenuType.Route,
      to: RouteName.Dashboard,
      title: 'general.requested',
    },
    {
      kind: MenuType.Route,
      to: RouteName.Pending,
      title: 'general.pending',
    },
    {
      kind: MenuType.Route,
      to: RouteName.Ongoing,
      title: 'general.current',
    },
    {
      kind: MenuType.Route,
      to: RouteName.Completed,
      title: 'general.completed',
    },
    {
      kind: MenuType.Route,
      to: RouteName.Archive,
      title: 'general.archive',
    },
  ],
  [Role.Researcher]: [
    {
      kind: MenuType.Route,
      to: RouteName.Dashboard,
      title: 'sidebar.dashboard',
      icon: 'bi bi-folder-fill',
    },
    {
      kind: MenuType.Route,
      to: RouteName.Archive,
      title: 'general.archive',
      icon: 'bi bi-archive-fill',
    },
  ],
  [Role.DizMember]: [
    {
      kind: MenuType.Route,
      to: RouteName.Dashboard,
      title: 'sidebar.dashboard',
      icon: 'bi bi-folder-fill',
    },
    {
      kind: MenuType.Route,
      to: RouteName.Archive,
      title: 'general.archive',
      icon: 'bi bi-archive-fill',
    },
  ],
  [Role.UacMember]: [
    {
      kind: MenuType.Route,
      to: RouteName.Dashboard,
      title: 'sidebar.dashboard',
      icon: 'bi bi-folder-fill',
    },
    {
      kind: MenuType.Route,
      to: RouteName.Archive,
      title: 'general.archive',
      icon: 'bi bi-archive-fill',
    },
  ],
}

const secondaryMenu: SidebarMenu[] = [
  {
    kind: MenuType.Url,
    title: 'sidebar.contact',
    url: 'mailto:info@forschen-fuer-gesundheit.de',
    icon: 'fa-regular fa-envelope',
  },
  {
    kind: MenuType.Url,
    title: 'sidebar.privacyNotice',
    url: 'https://forschen-fuer-gesundheit.de/nutzungsbedingungen.php#datenschutz',
    icon: 'fa fa-lock',
  },
  {
    kind: MenuType.Url,
    title: 'sidebar.terms',
    url: 'https://forschen-fuer-gesundheit.de/nutzungsbedingungen.php',
    icon: 'fa fa-section',
  },
]
</script>

<style lang="scss">
@import 'src/assets/sass/variable';

@mixin sidebar-block {
  width: $sidebar-width !important;
  transition-timing-function: ease;
}

.fdpg-sidebar {
  height: 100%;
  display: flex;
  position: fixed;
  padding: 46px 10px;
  background: $white;
  flex-direction: column;
  z-index: $sidebar-z-index;
  border-right: 1px solid $gray-400;
  transition-duration: $sidebar-transition-duration;
  @include sidebar-block;

  .logo {
    width: 179px;
    margin-left: 29px;
  }

  .fdpg-menu {
    width: 100%;
    height: 100%;
    margin-top: 15px;
    border-right: none;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .fdpg-menu__item {
      height: 44px;
      margin: 8px 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 600;
      color: $gray-900;
      line-height: 45px;
      border-radius: 4px;
      padding: 0 20px !important;
      text-decoration-line: none;

      &.fdpg-menu__item--exact-active,
      &:focus,
      &:hover {
        background-color: $gray-200;
      }

      i {
        color: $gray-900;
        width: 20px;
        text-align: center;
        font-size: 20px;
        margin-right: 12px;
        margin-left: 2px;
      }

      &.fdpg-menu__item--exact-active {
        i {
          color: $blue;
        }
      }

      .fdpg-menu__wrapper {
        display: flex;
        align-items: center;
      }
      .fdpg-sidebar__url {
        color: $gray-900;
        text-decoration: none;
      }

      .fdpg-menu__icons {
        float: right;

        .fdpg-menu__icon {
          border-radius: 8px;
          padding: 0 8px;
          line-height: 24px;
          margin-left: 4px;
          border: 1px solid;

          &--critical {
            background: $red-100;
            border-color: $red-100;
            color: $white;
          }

          &--high {
            background: $blue;
            border-color: $blue;
            color: $white;
          }

          &--medium {
            background: $white;
            border-color: $white;
            color: $black;
          }

          &--low {
            background: rgba(106, 116, 132, 0.1);
            border-color: rgba(106, 116, 132, 0.1);
            color: $gray-900;
          }
        }
      }
    }

    .el-divider {
      background-color: $gray-300;

      &.el-divider--horizontal {
        height: 2px;
        margin: 23px 0;
      }
    }
  }

  @media (max-width: $md) {
    padding: 46px 0;
    width: 0 !important;
    transition-timing-function: cubic-bezier(0.99, 0.01, 0.25, 1);
  }

  &.block {
    @include sidebar-block;
  }
}
</style>
