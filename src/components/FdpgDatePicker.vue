<template>
  <el-date-picker
    format="DD/MM/YYYY"
    class="fdpg-date-picker"
    :placeholder="$t(placeholder)"
    prefix-icon="bi-calendar-event"
    :disabled-date="disabledDate"
  />
</template>

<script setup lang="ts">
const props = defineProps({
  placeholder: {
    type: String,
    default: '',
  },
  minDate: {
    type: Date,
    default: () => undefined,
  },
})
const disabledDate = (time: Date) => {
  if (props.minDate) {
    return time <= props.minDate
  } else {
    return false
  }
}
</script>

<style lang="scss">
@import 'src/assets/sass/variable';

.fdpg-date-picker {
  width: 100% !important;
  height: 59px !important;

  .el-input__prefix {
    left: unset;
    right: 15px;

    i {
      font-size: 17px;
    }
  }

  .el-input__inner {
    height: 59px;
    color: $black;
    font-size: 18px;
    overflow: hidden;
    white-space: nowrap;
    padding: 0 45px 0 11px;
    text-overflow: ellipsis;
    font-family: 'Titillium Web', serif;
    border: 1px solid $gray-700;

    &:hover {
      border-color: $blue;
    }

    &:focus {
      transition: 1s;
      font-weight: 600;
      border-width: 2px;
      border-color: $blue;
      padding: 0 45px 0 10px;
      background-color: $gray-100;
      box-shadow: 0 0 10px -5px $blue;
    }
  }
}

.el-picker__popper {
  .el-picker-panel {
    margin: 0;
  }

  .el-popper__arrow {
    z-index: 0;
  }
}
</style>
