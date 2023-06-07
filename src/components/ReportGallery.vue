<template>
  <div class="report__images--display">
    <img
      v-for="image in props.uploads"
      :key="image._id"
      :src="image.downloadUrl"
      :alt="image.fileName"
      :title="image.fileName"
      height="20"
      width="35"
    />
  </div>
</template>
<script setup lang="ts">
import type { PropType } from 'vue'
import type { IReportFile } from '@/types/proposal.types'
const props = defineProps({
  uploads: {
    type: Array as PropType<IReportFile[]>,
    required: true,
  },
})
</script>
<style lang="scss" scoped>
.report__images--display {
  max-width: 120px;
  display: flex;
  align-items: center;

  img {
    position: relative;
    --img-size: 2rem;
    height: var(--img-size);
    width: var(--img-size);
    object-fit: cover;
    border-radius: 50%;
    box-shadow: rgba(0, 0, 0, 0.25) 2.5px 0.5px 1px;
  }

  $n: 3;
  @for $i from 1 through $n {
    img:nth-child(#{$i}) {
      z-index: $n - $i;
      transform: translate3d(0px - 5 * ($i - 1), 0, -1px - 5 * ($i - 1));
    }
  }
}
</style>
