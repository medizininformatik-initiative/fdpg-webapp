<template>
  <el-form-item class="fdpg-form-item">
    <slot />
  </el-form-item>
</template>

<script setup lang="ts"></script>

<style lang="scss">
@use '@/assets/sass/variable' as *;

.fdpg-form-item {
  margin-bottom: 0;

  &.is-error {
    .el-form-item__content {
      .fdpg-label {
        color: $error;
      }

      .fdpg-input,
      .fdpg-select,
      .fdpg-date-picker,
      .fdpg-number-input {
        &.is-focus {
          .el-input__inner {
            border-color: $error;
          }
        }

        .el-input__inner {
          border-color: $error;

          &:hover {
            border-color: $error;
          }

          &:focus {
            box-shadow: 0 0 10px -5px $error;
          }
        }
      }

      .el-form-item__error {
        position: initial;
      }
    }
  }
}
</style>
