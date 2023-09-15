<template>
  <el-header class="fdpg-header">
    <el-button circle type="text" class="fdpg-header__menu-button" @click="openSidebar">
      <i class="fa fa-bars" aria-hidden="true"></i>
    </el-button>
    <el-breadcrumb
      v-if="layoutStore.breadcrumbs.length > 0"
      class="fdpg-header-breadcrumb"
      separator-class="el-icon-arrow-right"
    >
      <el-breadcrumb-item
        v-for="({ name, displayName, params }, index) in layoutStore.breadcrumbs"
        :key="index"
        class="fdpg-header-breadcrumb__item"
        :to="setName(index, name, params)"
      >
        {{ displayName ? $t(displayName) : name ? $t(name) : '-' }}
      </el-breadcrumb-item>
    </el-breadcrumb>
    <span v-if="route.name === RouteName.UserProfile"></span>
    <el-input
      v-if="layoutStore.breadcrumbs.length <= 0 && route.name !== RouteName.UserProfile"
      v-model="proposalStore.search"
      class="fdpg-header__search-input"
      :placeholder="$t('header.searchForProposalsProjectsScientists')"
    >
      <template #suffix>
        <el-icon class="bi-search"></el-icon>
      </template>
    </el-input>
    <el-space direction="horizontal" :size="12">
      <FdpgDropdown :button="languageButton" :show-dropdown-icon="true" :items="languageDropdown" data-testId="header.languageButton"></FdpgDropdown>
      <FdpgHeaderRole />
      <FdpgDropdown :button="profileButton" :show-dropdown-icon="true" :items="profileDropdown" data-testId="header.profileButton"></FdpgDropdown>></FdpgDropdown>
    </el-space>
  </el-header>
</template>

<script setup lang="ts">
import type { SupportedLanguages } from '@/plugins/i18n'
import { useAuthStore } from '@/stores/auth/auth.store'
import { useLayoutStore } from '@/stores/layout.store'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import type { DropdownButton, DropdownItem } from '@/types/dropdown.types'
import { RouteName } from '@/types/route-name.enum'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import FdpgDropdown from './FdpgDropdown.vue'
import FdpgHeaderRole from './FdpgHeaderRole.vue'

const { locale } = useI18n()

const authStore = useAuthStore()
const layoutStore = useLayoutStore()
const proposalStore = useProposalStore()
const openSidebar = () => {
  layoutStore.setSidebarVisiblity(true)
}

const changeLocale = (newLocale: SupportedLanguages) => {
  localStorage.setItem('translationLocale', newLocale)
  locale.value = newLocale
}

const languages: Record<SupportedLanguages, DropdownItem> = {
  en: {
    kind: 'img',
    label: 'header.english',
    action: () => changeLocale('en'),
    src: new URL('@/assets/img/dashboard/flags/united-kingdom.png', import.meta.url).href,
  },
  de: {
    kind: 'img',
    label: 'header.german',
    action: () => changeLocale('de'),
    src: new URL('@/assets/img/dashboard/flags/germany.png', import.meta.url).href,
  },
}
const languageDropdown = Object.values(languages)

const languageButton = computed<DropdownButton>(() => {
  const currentLanguage = languages[locale.value as SupportedLanguages] ?? languages.en
  return {
    ...currentLanguage,
    isTranslatable: true,
  }
})

const profileButton = computed<DropdownButton>(() => {
  return authStore.isLoggedIn
    ? {
        kind: 'basic',
        isTranslatable: false,
        label: authStore.profile?.name ?? 'Profile',
      }
    : {
        kind: 'basic',
        isTranslatable: true,
        label: 'header.notLoggedInGreeting',
      }
})

const profileDropdown = computed<DropdownItem[]>(() => {
  const items: DropdownItem[] = []
  if (authStore.isLoggedIn) {
    items.push(
      {
        kind: 'icon',
        iconClass: 'fa fa-arrow-right-from-bracket',
        action: () => authStore.logOut(),
        label: 'header.logout',
      },
      {
        kind: 'icon',
        iconClass: 'fa fa-user',
        action: () => goToProfile(),
        label: 'header.goToProfile',
      },
    )
  } else {
    items.push({
      kind: 'icon',
      iconClass: 'fa fa-arrow-right-to-bracket',
      action: () => authStore.logIn(),
      label: 'header.login',
    })
  }
  return items
})

const setName = (index: number, name: RouteName, params: Record<string, string | string[]> | undefined) => {
  if (index !== layoutStore.breadcrumbs.length - 1) {
    if (params && Object.keys(params).length <= 0) {
      return { name: name, params: params }
    } else {
      return { name: name }
    }
  } else {
    return null
  }
}

const route = useRoute()
const router = useRouter()
const goToProfile = () => {
  router.push({ name: RouteName.UserProfile })
}
</script>

<style lang="scss">
@import 'src/assets/sass/variable';

.fdpg-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: $header-height !important;
  padding: 23px 60px 0 39px;

  .fdpg-header__search-input {
    max-width: 330px;

    .el-input__inner {
      border: none;
      padding-left: 0;
      color: $gray-900;
      font-weight: 400;
      border-radius: 0;
      padding-right: 50px;
      border-bottom: 1px solid $gray-800;
      font-family: 'Titillium Web', serif;
    }

    .el-input__suffix {
      right: 6px;

      .el-input__suffix-inner {
        .el-icon {
          align-self: center;
          color: $blue;
        }
      }
    }
  }

  .fdpg-header__menu-button {
    display: none;
  }

  .fdpg-header-breadcrumb {
    font-size: 16px;

    .fdpg-header-breadcrumb__item {
      .el-breadcrumb__separator {
        margin: 0 8px;
        font-weight: 600;
        color: $gray-900;
      }

      .el-breadcrumb__inner {
        font-weight: 600;
        color: $gray-900;

        &.is-link {
          font-weight: 400;
          color: $gray-800;
          text-decoration-line: underline;
          text-decoration-color: $gray-500;

          &:hover {
            color: $gray-900;
          }
        }
      }
    }
  }

  .el-space {
    .el-space__item {
      &:last-child {
        margin-right: 0 !important;
      }

      .el-avatar {
        width: 44px;
        height: 44px;
        line-height: 44px;
      }
    }
  }

  @media (max-width: $xxl) {
    padding: 0 41px 0 20px;
  }

  @media (max-width: $md) {
    .fdpg-header__menu-button {
      display: block;
    }

    .fdpg-header-breadcrumb {
      display: none;
    }

    .fdpg-header__search-input {
      display: none;
    }
  }
}
</style>
