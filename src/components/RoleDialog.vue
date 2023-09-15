<template>
  <FdpgDialog v-model="dialogOpen" :title="$t('roles.changeRoleModalTitle')" class="reports--modal" @close="closeDialog">
      <div>
        <p>{{ $t('roles.changeRoleModalText') }}</p>
      </div>
      <el-tag
        v-for="item in auth.roles"
        :key="item"
        type=""
        class="tag--margin"
        :effect="item === selectedRole ? 'dark' : 'light'"
        @click="selectedRole = item"
        >
        {{ $t(`roles.${item}`) }}
      </el-tag>
      <template #footer>
        <span>
          <el-button type="text" @click="closeDialog">{{ $t('general.cancel') }}</el-button>
          <el-button
          type="primary"
          data-testid="button__confirmNewRole"
          @click="saveNewRole"
          >
          {{ $t('general.editProfileModalAction') }}
        </el-button>
      </span>
    </template>
  </FdpgDialog>
</template>
<script setup lang="ts">
import FdpgDialog from './FdpgDialog.vue'
import { useAuthStore } from '@/stores/auth/auth.store'
import { computed, ref } from 'vue'
import type { Role } from '../types/oidc.types'
import { useRouter } from 'vue-router'
import { RouteName } from '@/types/route-name.enum'
const router = useRouter()

const auth = useAuthStore()
const dialogOpen = computed(() => auth.isChangeRoleDialogOpen)
const closeDialog = () => {
  auth.closeChangeRoleDialog()
  router.push({name: RouteName.ProposalDetails, params: {id: auth.redirectToDetailPageProposalId}})
}

const selectedRole = ref<Role| undefined>(auth.singleKnownRole)
const saveNewRole = () => {
  if(selectedRole.value) {
    auth.setSelectedRole(selectedRole.value)
  }
  closeDialog()
}
</script>
<style lang="scss" scoped>
@import 'src/assets/sass/variable';
.el-tag--dark {
  background: $blue;
  color: $white;
  cursor: pointer;
}

.el-tag--light {
  opacity: 0.5;
  background: $blue;
  color: $white;
  cursor: pointer;
}
.tag--margin {
  margin: 10px
}
dt {
  font-weight: bold;
}
</style>
