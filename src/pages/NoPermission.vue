<template>
  <p>{{ $t('general.noPermissionToViewPage') }}</p>
  <router-link :to="{ name: RouteName.Dashboard }">{{ $t('general.goToDashboard') }}</router-link>
</template>

<script lang="ts" setup>
import { RouteName } from '@/types/route-name.enum'
</script>
