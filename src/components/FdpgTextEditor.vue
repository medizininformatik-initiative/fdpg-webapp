<template>
  <div :class="['w-full fdpg-text-editor', disabled ? 'readonly-view' : '']">
    <div ref="editorContainer"></div>
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
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { FormInstance } from 'element-plus'
import type { PropType } from 'vue'

const TOOLBAR = [
  [{ header: [1, 2, 3, false] }],
  ['bold', 'italic', 'underline', 'link'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['clean'],
]

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

const editorContainer = ref<HTMLElement>()
let quill: Quill | null = null

const isBlurred = ref(false)
const charCount = ref(0)

const showCharCount = computed(() => {
  if (!props.maxLength) return false
  return charCount.value >= Math.floor((props.maxLength * 2) / 3)
})

function isEffectivelyEmpty(html: string | undefined): boolean {
  return !html || html.replace(/<[^>]*>/g, '').replace(/\s/g, '') === ''
}

/**
 * Convert an HTML string to a Quill Delta using the clipboard module.
 * In Quill v2, clipboard.convert expects { html, text } — NOT a bare string
 * as in Quill v1. @vueup/vue-quill was passing a bare string, which caused
 * clipboard.convert to receive undefined for the html property, resulting in
 * an empty Delta and missing content (especially <ul>/<li> lists).
 */
function htmlToContents(html: string) {
  return quill!.clipboard.convert({ html, text: '' })
}

function setEditorContent(html: string | undefined) {
  if (!quill) return
  if (isEffectivelyEmpty(html)) {
    quill.setText('', 'api')
    return
  }
  const delta = htmlToContents(html!)
  quill.setContents(delta, 'api')
}

onMounted(() => {
  if (!editorContainer.value) return

  quill = new Quill(editorContainer.value, {
    theme: 'snow',
    readOnly: props.disabled,
    placeholder: props.disabled ? '' : (props.placeholder ?? ''),
    modules: {
      toolbar: TOOLBAR,
    },
  })

  if (!isEffectivelyEmpty(props.modelValue)) {
    setEditorContent(props.modelValue)
  }

  quill.on('text-change', (_delta, _old, source) => {
    // Ignore programmatic updates (setContents/setText with source='api')
    // to prevent the emit → watcher → setContents loop.
    if (source === 'api' || !quill) return

    if (props.maxLength) {
      const length = Math.max(0, quill.getText().length - 1)
      if (length > props.maxLength) {
        // Use 'api' source so this deleteText call does not re-trigger the handler.
        quill.deleteText(props.maxLength, length - props.maxLength, 'api')
        charCount.value = props.maxLength
        // Emit truncated value after deletion.
        const truncatedHtml = quill.root.innerHTML
        emit('update:modelValue', isEffectivelyEmpty(truncatedHtml) ? '' : truncatedHtml)
        return
      }
      charCount.value = length
    }

    const html = quill.root.innerHTML
    const value = isEffectivelyEmpty(html) ? '' : html
    emit('update:modelValue', value)
    if (props.formRef && props.fieldPath) {
      props.formRef.validateField(props.fieldPath)
    }
  })

  quill.on('selection-change', (range) => {
    if (range === null) {
      isBlurred.value = true
      emit('blur')
      if (props.formRef && props.fieldPath) {
        props.formRef.validateField(props.fieldPath)
      }
    }
  })
})

onBeforeUnmount(() => {
  quill = null
})

watch(
  () => props.modelValue,
  (newValue) => {
    if (!quill) return
    // Only update if what Quill currently shows differs from the incoming value.
    // Comparing root.innerHTML avoids redundant setContents calls when the
    // text-change handler already emitted this exact value.
    const current = isEffectivelyEmpty(quill.root.innerHTML) ? '' : quill.root.innerHTML
    const incoming = isEffectivelyEmpty(newValue) ? '' : newValue
    if (current === incoming) return
    setEditorContent(newValue)
  },
)

watch(
  () => props.disabled,
  (disabled) => {
    quill?.enable(!disabled)
    if (!quill) return
    quill.root.dataset.placeholder = disabled ? '' : (props.placeholder ?? '')
  },
)

watch(
  () => props.placeholder,
  (newPlaceholder) => {
    if (!quill || props.disabled) return
    quill.root.dataset.placeholder = newPlaceholder ?? ''
  },
)

const isEmpty = () => {
  if (!quill) return true
  const length = quill.getLength()
  return length === 0 || length === 1
}

// Expose the same surface as before so external refs (e.g. in tests or
// MessageCenterAnswerCreator) keep working.
const textEditor = {
  getQuill: () => quill,
  getContents: () => quill?.getContents(),
  setContents: (delta: Parameters<Quill['setContents']>[0] | null) => {
    if (!quill) return
    if (!delta) quill.setText('', 'api')
    else quill.setContents(delta, 'api')
  },
}

defineExpose({
  textEditor,
  isEmpty,
  isBlurred,
  charCount,
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

.ql-toolbar .ql-picker-label {
  display: flex;
  align-items: center;
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
