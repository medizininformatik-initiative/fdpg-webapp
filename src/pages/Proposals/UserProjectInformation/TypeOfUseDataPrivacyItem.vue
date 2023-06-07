<template>
  <dt>{{ headline }}</dt>
  <dd ref="expandableText" class="privacy-text" :class="{ expanded: isExpanded }">{{ text }}</dd>
  <div class="button-row">
    <el-button v-if="isExpandingNeeded" type="text" @click="toggleExpand">
      {{ $t(isExpanded ? 'dashboard.showLess' : 'dashboard.showMore') }}
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

defineProps({
  headline: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
})

const isExpanded = ref(false)
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

const expandableText = ref<HTMLElement>()
const isExpandingNeeded = ref(false)

const calculateIsExpandingNeeded = () => {
  isExpanded.value = false
  if (expandableText.value) {
    isExpandingNeeded.value = expandableText.value.offsetHeight < expandableText.value.scrollHeight
  }
}

window.addEventListener('resize', calculateIsExpandingNeeded)

onMounted(() => {
  calculateIsExpandingNeeded()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', calculateIsExpandingNeeded)
})
</script>
<style lang="scss" scoped>
@import 'src/assets/sass/variable';

dt::after {
  content: ':';
}

dd {
  margin-left: 1rem;
}

.privacy-text {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  white-space: pre-wrap;

  &.expanded {
    -webkit-line-clamp: unset;
  }
}

.button-row {
  display: flex;
  justify-content: flex-end;
  min-height: 52px;
}
</style>
