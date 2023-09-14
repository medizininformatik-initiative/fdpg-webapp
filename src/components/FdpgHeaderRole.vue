<template>
        <div v-if="authStore.roles.length === 1" class="profile-role">
          {{ $t(`roles.HEADER_${authStore.singleKnownRole}`) }}
        </div>

        <div v-if="authStore.roles.length > 1" class="role__dropdown">
            <FdpgDropdown :button="dropdownButton" :show-dropdown-icon="true" :items="roleDropdownItems">
              <div class="profile-role">
                {{ $t(`roles.HEADER_${authStore.singleKnownRole}`) }}
              </div>
            </FdpgDropdown>
        </div>
</template>
<script setup lang="ts">
import { useAuthStore } from '@/stores/auth/auth.store'
import FdpgDropdown from './FdpgDropdown.vue'
import type { DropdownButton, DropdownItem } from '@/types/dropdown.types';
import { computed } from 'vue';
import type { Role } from '@/types/oidc.types'
import { useRouter } from 'vue-router';
import { RouteName } from '@/types/route-name.enum';
const router = useRouter()

const authStore = useAuthStore()
const dropdownButton = {
  kind: 'basic',
  isTranslatable: false,
  label: '',
} as DropdownButton
const roleDropdownItems = computed<DropdownItem[]>(() =>  authStore.roles.map((role: Role) => ({
      kind: 'basic',
      isTranslatable: false,
      label: `roles.HEADER_${role}`,
      action: () => {
        authStore.setSelectedRole(role)
        router.push({name: RouteName.Dashboard})
      }
    })))
</script>
<style lang="scss">
@import 'src/assets/sass/variable';

.profile-role {
  overflow: hidden;
  background: $blue;
  color: $white;
  margin-right: 5px;
  border-radius: 30px;
  padding: 0 1rem;
  width: auto;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: bold;
}
.role__dropdown {
  .caret-icon {
    color:white;
    margin-left: -25px
  }
}
</style>
