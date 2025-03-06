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
      :placeholder="placeholder"
      @blur="handleBlur"
    />
  </div>
</template>
<script setup lang="ts">
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import { computed, onBeforeMount, ref, watch } from 'vue'
import type { FormInstance } from 'element-plus'
import type { PropType } from 'vue'

const props = defineProps({
  modelValue: String,
  disabled: Boolean,
  placeholder: String,
  formRef: {
    type: Object as PropType<FormInstance>,
    required: false,
    default: () => undefined,
  },
  fieldPath: {
    type: String,
    required: false,
    default: '',
  },
})
const emit = defineEmits(['update:modelValue', 'blur'])

const textEditor = ref()
const isBlurred = ref(false)

const value = computed<string | null>({
  get() {
    return props.modelValue || null
  },
  set(val) {
    if (val && val.trim() !== '<p></p>' && val.trim() !== '<p><br></p>') {
      emit('update:modelValue', val)
    } else {
      emit('update:modelValue', '')
    }
  },
})
const options = ref({})
const placeholder = ref<string | undefined>('')

const isEmpty = () => {
  if (!textEditor.value) return true
  const contents = textEditor.value.getContents()
  return contents.length() === 0 || (contents.length() === 1 && contents.get(0).length() === 0)
}

const handleBlur = () => {
  isBlurred.value = true
  emit('blur')

  // Handle form validation if formRef and fieldPath are provided
  if (props.formRef && props.fieldPath) {
    props.formRef.validateField(props.fieldPath)
  }
}

defineExpose({
  textEditor,
  isEmpty,
  isBlurred,
})

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue === '' || newValue === '<p></p>' || newValue === '<p><br></p>') {
      textEditor.value?.setContents(null)
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

.ql-editor.ql-blank::before {
  position: unset;
}
</style>
