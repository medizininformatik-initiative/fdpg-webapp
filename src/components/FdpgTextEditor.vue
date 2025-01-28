<template>
  <div class="w-full">
    <QuillEditor
      theme="snow"
      v-model:content="value"
      contentType="html"
      ref="textEditor"
      :options="options"
      :enable="!props.disabled"
      :readOnly="props.disabled"
      :placeholder="!!placeholder ? $t(placeholder) : ''"
    />
  </div>
</template>
<script setup lang="ts">
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import { computed, onBeforeMount, ref, watch } from 'vue'
const props = defineProps({
  modelValue: String,
  disabled: Boolean,
  placeholder: String,
})
const emit = defineEmits(['update:modelValue'])

const textEditor = ref()
defineExpose({
  textEditor,
})

const value = computed<string | null>({
  get() {
    return props.modelValue || null
  },
  set(val) {
    emit('update:modelValue', val)
  },
})
const options = ref({})
const placeholder = ref<string | undefined>('')

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue === '') {
      textEditor.value.setContents(null)
    }
  },
)

onBeforeMount(() => {
  placeholder.value = !props.disabled ? props.placeholder : ''
})
</script>
<style>
.w-full {
  width: 100%;
}
</style>
