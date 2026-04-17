<template>
  <div :class="['w-full fdpg-text-editor', disabled ? 'readonly-view' : '']">
    <QuillEditor
      theme="snow"
      v-model:content="value"
      contentType="html"
      ref="textEditor"
      :options="options"
      :enable="!disabled"
      :readOnly="disabled"
      :placeholder="placeholder"
      @blur="handleBlur"
      @text-change="handleTextChange"
    />
    <div
      v-if="props.maxLength && showCharCount"
      :class="[
        'fdpg-text-editor__char-count',
        charCount > props.maxLength ? 'fdpg-text-editor__char-count--exceeded' : '',
      ]"
    >
      {{ charCount }} / {{ props.maxLength }}
    </div>
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
  maxLength: {
    type: Number,
    required: false,
    default: undefined,
  },
})
const emit = defineEmits(['update:modelValue', 'blur'])

const textEditor = ref()
const isBlurred = ref(false)
const charCount = ref(0)

const showCharCount = computed(() => {
  if (!props.maxLength) return false
  return charCount.value >= Math.floor((props.maxLength * 2) / 3)
})

const handleTextChange = () => {
  if (!props.maxLength) return
  const quill = textEditor.value?.getQuill()
  if (!quill) return

  const length = Math.max(0, quill.getText().length - 1)
  charCount.value = length

  if (length > props.maxLength) {
    quill.deleteText(props.maxLength, length - props.maxLength)
  }
}

watch(
  () => props.placeholder,
  () => {
    const editorInstance = textEditor.value.getQuill()
    editorInstance.root.dataset.placeholder = props.placeholder
  },
)

const value = computed<string | null>({
  get() {
    return props.modelValue || null
  },
  set(val) {
    if (!val) {
      emit('update:modelValue', '')
      if (props.formRef && props.fieldPath) {
        props.formRef.validateField(props.fieldPath)
      }
      return
    }

    const cleanContent = val.replace(/<[^>]*>/g, '').replace(/\s/g, '')

    if (cleanContent === '') {
      emit('update:modelValue', '')
      if (props.formRef && props.fieldPath) {
        props.formRef.validateField(props.fieldPath)
      }
    } else {
      emit('update:modelValue', val)
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
  charCount,
})

watch(
  () => props.modelValue,
  (newValue) => {
    if (!newValue || newValue.replace(/<[^>]*>/g, '').replace(/\s/g, '') === '') {
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
  min-height: 150px;
}

.readonly-view {
  .ql-container {
    border: unset;
  }
  .ql-toolbar {
    display: none;
  }
}

.ql-editor.ql-blank::before {
  position: unset;
}

.el-card:has(.fdpg-text-editor) {
  overflow: visible;
}

.el-card:has(.fdpg-text-editor) .el-card__body {
  overflow: visible;
}

.el-table:has(.fdpg-text-editor) {
  overflow: visible;
}

.el-table:has(.fdpg-text-editor) .el-table__inner-wrapper,
.el-table:has(.fdpg-text-editor) .el-table__body-wrapper,
.el-table:has(.fdpg-text-editor) .el-scrollbar,
.el-table:has(.fdpg-text-editor) .el-scrollbar__wrap,
.el-table:has(.fdpg-text-editor) .el-scrollbar__view,
.el-table:has(.fdpg-text-editor) .el-table__body,
.el-table:has(.fdpg-text-editor) .el-table__expanded-cell,
.el-table .cell:has(.fdpg-text-editor),
.el-collapse-item__wrap:has(.fdpg-text-editor) {
  overflow: visible !important ;
}

.fdpg-text-editor__char-count {
  text-align: right;
  font-size: 0.75rem;
  color: #909399;
  margin-top: 4px;

  &.fdpg-text-editor__char-count--exceeded {
    color: #f56c6c;
    font-weight: 600;
  }
}
</style>
