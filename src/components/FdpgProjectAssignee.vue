<template>
  <FdpgLabel required size="medium" class="form-label-mt-4 scrollAnker" html-for="proposal.projectAssignee" />
  <el-card class="form-group">
    <tempalte v-if="modelValue">
      <el-row :gutter="20">
        <el-col :sm="24" :md="12">
          <FdpgLabel html-for="proposal.firstName" />
          <p>{{ modelValue.firstName }}</p>
        </el-col>
        <el-col :sm="24" :md="12">
          <FdpgLabel html-for="proposal.lastName" />
          <p>{{ modelValue.lastName }}</p>
        </el-col>
      </el-row>
    </tempalte>
    <el-row :gutter="20">
      <el-col :sm="24" :md="12">
        <FdpgLabel html-for="proposal.emailAddress" />
        <FdpgSelect
          :modelValue="props.modelValue?.email"
          :options="emailOptions"
          :placeholder="t('proposal.emailAddress')"
          filterable
          remote
          :remote-method="searchEmails"
          :loading="isLoading"
          class="form-select"
          @change="getUserByEmail"
          :disabled="currentUserRole !== Role.FdpgMember"
          clearable
        />
      </el-col>
    </el-row>
  </el-card>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user.store'
import FdpgSelect from './FdpgSelect.vue'
import type { IProjectAssignee } from '@/types/proposal.types'
import { ref, type PropType } from 'vue' // Removed computed, onMounted, Ref
import { Role } from '@/types/oidc.types'
import { useI18n } from 'vue-i18n'
import useNotifications from '@/composables/use-notifications'
import FdpgLabel from './FdpgLabel.vue'
import { useDebounceFn } from '@vueuse/core'
import type { PlatformIdentifier } from '@/types/platform-identifier.enum'

const props = defineProps({
  modelValue: {
    type: Object as PropType<IProjectAssignee | null>,
    required: true,
  },
  currentUserRole: {
    type: String as PropType<Role>,
    required: true,
  },
  dataSources: {
    type: Array as PropType<PlatformIdentifier[]>,
    required: true,
  },
})

const userStore = useUserStore()
const { t } = useI18n()
const { showErrorMessage } = useNotifications()

const emit = defineEmits(['update:modelValue'])

const emailOptions = ref<{ label: string; value: string }[]>([])
const isLoading = ref(false)

const getUserByEmail = async (email: string) => {
  if (!email) {
    emit('update:modelValue', null)
    return
  }

  try {
    const user = await userStore.getUserByEmail(email)

    if (user) {
      const selected: IProjectAssignee = {
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      }
      emit('update:modelValue', selected)
    } else {
      showErrorMessage('User not found for the provided email.')
      emit('update:modelValue', null)
    }
  } catch (error) {
    showErrorMessage('Error fetching user by email: ' + error)
    emit('update:modelValue', null)
  }
}

const handleEmailSearch = async (query: string) => {
  if (!query || query.trim().length < 3) {
    emailOptions.value = []
    return
  }

  isLoading.value = true
  try {
    const response = await userStore.searchEmailsByPrefix(
      query.trim(),
      [],
      [Role.FdpgMember, Role.DataSourceMember],
      [...props.dataSources],
    )
    emailOptions.value = response.emails.map((email) => ({ label: email, value: email }))
  } catch (error) {
    showErrorMessage('Error searching emails: ' + error)
    emailOptions.value = []
  } finally {
    isLoading.value = false
  }
}

const searchEmails = useDebounceFn(handleEmailSearch, 300)
</script>

<style lang="scss" scoped>
@use '@/assets/sass/variable' as *;
</style>
