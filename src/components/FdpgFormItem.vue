<template>
  <el-form-item class="fdpg-form-item">
    <slot />
  </el-form-item>
</template>

<script setup lang="ts"></script>

<style lang="scss">
@import 'src/assets/sass/variable';

.fdpg-form-item {
  margin-bottom: 0;

  &.is-error {
    .el-form-item__content {
      .fdpg-label {
        color: $red;
      }

      .fdpg-input,
      .fdpg-select,
      .fdpg-date-picker {
        &.is-focus {
          .el-input__inner {
            border-color: $red;
          }
        }

        .el-input__inner {
          &:hover {
            border-color: $red;
          }

          &:focus {
            box-shadow: 0 0 10px -5px $red;
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
