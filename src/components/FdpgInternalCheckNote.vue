<template>
  <div>
    <FdpgLabel html-for="proposal.internalCheckNotes" />
    <FdpgTextEditor
      v-model="localNote"
      :placeholder="$t('proposal.internalCheckNotesPlaceholder')"
      :disabled="isDisabled"
      @blur="handleBlur(localNote)"
      @input="handleInput"
      @update:modelValue="debouncedHandleChange(localNote)"
      ref="editorRef"
    ></FdpgTextEditor>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import FdpgLabel from './FdpgLabel.vue'
import FdpgTextEditor from './FdpgTextEditor.vue'
import { defineProps, defineEmits } from '@vue/runtime-core'
import { debounce } from 'lodash-es'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  isDisabled: Boolean,
  currentNote: {
    type: Object as () => string | null,
    default: () => '',
  },
})

const emit = defineEmits(['update:listItem'])

const localNote = ref(props.currentNote ?? '')
const editorRef = ref()
const isInitialized = ref(false)
const isUserTyping = ref(false)

onMounted(() => {
  localNote.value = props.currentNote ?? ''
  isInitialized.value = true
})

watch(
  () => props.currentNote,
  (newValue) => {
    if (newValue !== localNote.value && isInitialized.value && !isUserTyping.value) {
      localNote.value = newValue ?? ''
    }
  },
)

const handleBlur = (value: string) => {
  isUserTyping.value = false
  emit('update:listItem', {
    fdpgInternalCheckNotes: value,
  })
}

const debouncedHandleChange = debounce((value: string) => {
  isUserTyping.value = false
  emit('update:listItem', {
    fdpgInternalCheckNotes: value,
  })
}, 1000)

const handleInput = () => {
  isUserTyping.value = true
}
</script>

<style lang="scss" scoped>
@use '@/assets/sass/variable' as *;
@use 'sass:color';

.note-meta {
  margin-bottom: 20px;
  color: $gray-800;
  .message-footer {
    display: flex;
    justify-content: space-between;
    margin-top: 1rem;
  }
}
</style>
