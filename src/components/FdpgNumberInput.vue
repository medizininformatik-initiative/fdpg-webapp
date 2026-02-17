<template>
  <el-input-number
    controls-position="right"
    class="fdpg-number-input"
    :placeholder="$t(placeholder)"
    @blur="handleBlur"
    @focus="handleFocus"
    :disabled="readonly"
  />
</template>

<script setup lang="ts">
defineProps({
  placeholder: {
    type: String,
    default: '',
  },
  readonly: {
    type: Boolean,
    required: false,
    default: false,
  },
})

const handleFocus = (e) => {
  e.target.parentElement.parentElement.previousSibling.classList.add('focused')
}

const handleBlur = (e) => {
  e.target.parentElement.parentElement.previousSibling.classList.remove('focused')
}
</script>

<style lang="scss">
@use '@/assets/sass/variable' as *;

.fdpg-number-input {
  width: 100%;

  .el-input-number__decrease {
    display: none;
  }

  .el-input-number__increase {
    display: none;
  }

  .el-input__inner {
    height: 59px;
    color: $black;
    padding: 0 11px;
    font-size: 18px;
    overflow: hidden;
    text-align: left;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-family: 'Titillium Web', serif;
    border: 1px solid $gray-700;

    &:hover {
      border-color: $blue;
    }

    &:focus {
      font-weight: 600;
      border-width: 2px;
      border-color: $blue;
      background-color: $gray-300;
      box-shadow: 0 0 10px -5px $blue;
      transition: 1s;
    }
  }
}
</style>
