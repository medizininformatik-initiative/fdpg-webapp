<template>
  <div class="custom-alert-wrapper">
    <el-alert type="info" :closable="true" show-icon class="custom-alert">
      <template #default>
        <span class="alert-text">{{ message }}</span>
      </template>
      <template #icon>
        <img :src="logo || '/favicon.png'" alt="" class="alert-logo" />
      </template>
    </el-alert>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  message: string
  logo?: string
}>()
</script>
<style scoped lang="scss">
@use '@/assets/sass/variable' as *;

.custom-alert-wrapper {
  margin: 2rem 0;
}
.custom-alert {
  border: 1px solid $gray-700;
  border-radius: 5px;
  background-color: unset;
}
.custom-alert :deep(.el-alert__content) {
  width: 100%;
}

.custom-alert :deep(.el-alert__title),
.custom-alert :deep(.el-alert__description) {
  margin: 0;
  width: 100%;
}

.alert-text {
  display: inline-block;
  width: 100%;
  font-size: 20px;
  color: $gray-900;
}

.alert-logo {
  width: 25px;
  height: 25px;
}

.el-alert {
  margin: 20px 0 0;
}
.el-alert:first-child {
  margin: 0;
}
</style>
