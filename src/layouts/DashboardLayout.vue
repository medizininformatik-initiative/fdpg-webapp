<template>
  <el-container class="fdpg-dashboard-layout">
    <FdpgSidebar></FdpgSidebar>
    <el-container>
      <FdpgHeader />
      <el-main id="main-scroll-top">
        <router-view :user-role="userRole" />
      </el-main>
      <div
        class="fdpg-mask"
        :class="{ 'fdpg-mask--visible': layoutStore.isSidebarVisible }"
        @click="setSidebarVisiblity(false)"
      />
      <FdpgMessageBox />
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import FdpgHeader from '@/components/FdpgHeader.vue'
import FdpgSidebar from '@/components/FdpgSidebar.vue'
import FdpgMessageBox from '@/components/FdpgMessageBox.vue'
import { useAuthStore } from '@/stores/auth/auth.store'
import { useLayoutStore } from '@/stores/layout.store'
import { Role } from '@/types/oidc.types'
import type { ComputedRef} from 'vue';
import { computed, onMounted, onUnmounted } from 'vue'

const layoutStore = useLayoutStore()
const authStore = useAuthStore()

const userRole: ComputedRef<Role | undefined> = computed(() => {
  if (authStore.roles.length === 1) {
    return authStore.roles[0]
  } else if (authStore.roles.length > 1) {
    return Role.Researcher
  }
  return undefined
})

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

const handleResize = () => {
  if (window.innerWidth > 991) {
    setSidebarVisiblity(true)
  } else {
    setSidebarVisiblity(false)
  }
}

const setSidebarVisiblity = (isVisible: boolean) => {
  layoutStore.setSidebarVisiblity(isVisible)
}
</script>

<style lang="scss" scoped>
@import 'src/assets/sass/variable';

.fdpg-dashboard-layout {
  & > .el-container {
    flex: 1;
    min-height: 100vh;
    position: relative;
    flex-direction: column;
    margin-left: $sidebar-width;
    transition-duration: $sidebar-transition-duration;

    .fdpg-mask {
      width: 100%;
      height: 100%;
      display: none;
      position: absolute;
      z-index: $mask-z-index;
      background: rgba(0, 0, 0, 0.6);
    }

    .el-main {
      padding: 0 70px 0 39px;
      height: calc(100vh - 140px);
    }
  }

  @media (max-width: $xxl) {
    & > .el-container {
      .el-main {
        padding: 0 41px 0 20px;
      }
    }
  }

  @media (max-width: $md) {
    & > .el-container {
      margin-left: 0;

      .fdpg-mask {
        &.fdpg-mask--visible {
          display: block;
        }
      }
    }
  }
}
</style>

<style>
.project-overview {
  font-weight: 700;
  font-size: 32px;
  line-height: 49px;
  margin: 0;
}

.project-count {
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
  margin: 0 0 30px;
}
</style>
