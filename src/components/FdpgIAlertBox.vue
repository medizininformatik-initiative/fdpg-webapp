<template>
  <div class="custom-alert-wrapper">
    <el-alert type="info" :closable="true" show-icon class="custom-alert">
      <template #default>
        <span class="alert-text">{{ message }}</span>
      </template>
      <template #icon>
        <img :src="logoBase64" alt="" class="alert-logo" />
      </template>
    </el-alert>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  message: string
  logoBase64: string
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

.custom-alert :deep(.el-alert__icon) {
  width: auto !important;
  height: auto !important;
  margin-right: 16px;
}

.custom-alert :deep(.el-icon) {
  width: auto !important;
  height: 220px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
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
  width: auto !important;
  height: 220px !important;
  max-width: none !important;
  max-height: none !important;
  object-fit: contain;
}

.el-alert {
  margin: 20px 0 0;
}
.el-alert:first-child {
  margin: 0;
}
</style>
