<template>
  <Dialog class="fdpg-dialog" as="div" :open="value" @close="setIsOpen">
    <DialogOverlay class="dialog-overlay" />
    <section class="panel-wrapper">
      <DialogPanel class="panel">
        <slot name="header">
          <DialogTitle as="h2" class="header">{{ title }}</DialogTitle>
        </slot>
        <template v-if="message">
          {{ message }}
        </template>
        <slot />
        <div class="footer">
          <slot name="footer"></slot>
        </div>
      </DialogPanel>
    </section>
  </Dialog>
</template>

<script setup lang="ts">
import { Dialog, DialogOverlay, DialogPanel, DialogTitle } from '@headlessui/vue'
import { useVModel } from '@vueuse/core'

const emit = defineEmits(['update:modelValue', 'close', 'beforeClose'])
const props = defineProps({
  modelValue: {
    type: Boolean,
  },
  title: {
    type: String,
    default: '',
  },
  message: {
    type: String,
    default: '',
  },
})
const value = useVModel(props, 'modelValue', emit)

const setIsOpen = (newValue: boolean) => {
  value.value = newValue
  emit('beforeClose')
  emit('close')
}
</script>

<style lang="scss">
@import 'src/assets/sass/variable';
.fdpg-dialog {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
  .header {
    margin: 0px;
    padding-bottom: 20px;
    font-size: 20px;
    font-weight: 700;
  }
  .dialog-overlay {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(125, 125, 125, 0.3);
    backdrop-filter: blur(5px);
  }

  .panel-wrapper {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem;
  }
  .panel {
    max-height: 75vh;
    overflow: scroll;
    padding: 20px;
    background: white;
    width: 100%;
    max-width: 700px;
  }
  .footer {
    display: flex;
    justify-content: flex-end;
    padding-top: 30px;
    button:first-of-type {
      padding: 0px 15px 0px;
    }
    button:focus {
      box-shadow: 0 0 15px 0 lighten($blue, 30%);
    }
  }

  .fdpg-upload-list-item {
    margin-top: 16px;
    font-weight: 700;
    color: $blue;
    font-size: 18px;
    display: flex;

    span {
      margin-left: 4px;
      font-weight: 400;
      font-size: 16px;
      color: $gray-900;
    }

    .el-icon {
      margin-left: 4px;
      cursor: pointer;
    }
  }

  .el-steps {
    margin-top: 30px;
  }
}
</style>
