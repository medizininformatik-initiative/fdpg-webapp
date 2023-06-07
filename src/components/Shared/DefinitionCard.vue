<template>
  <el-card :shadow="isPrint ? 'never' : 'always'">
    <el-row :gutter="20">
      <el-col
        v-for="({ label, size, definitions, hideIfOtherValueIsTruthy, hideIfThisValueIsFalsy }, termIdx) in card.terms"
        :key="'group' + termIdx"
        :sm="24"
        :md="size"
      >
        <template
          v-if="
            !(hideIfThisValueIsFalsy && !dtoAccess[hideIfThisValueIsFalsy]) &&
            !(hideIfOtherValueIsTruthy && dtoAccess[hideIfOtherValueIsTruthy])
          "
        >
          <div role="term">{{ $t(label) }}</div>

          <div v-for="(definition, definitionIdx) in definitions" :key="'def' + definitionIdx" role="definition">
            <span v-for="(content, contentIdx) in definition" :key="'content' + contentIdx">
              <template v-if="!(content.hideIfOtherValueIsTruthy && dtoAccess[content.hideIfOtherValueIsTruthy])">
                <ul v-if="content.isList">
                  <li v-for="(listItem, listItemIdx) in dtoAccess[content.key]" :key="'li' + termIdx + listItemIdx">
                    <DefinitionCardItem class="print-region" :definition="content" :value="listItem" />
                  </li>
                </ul>

                <DefinitionCardItem v-if="!content.isList" :definition="content" :value="dtoAccess[content.key]" />
              </template>
            </span>
          </div>
        </template>
      </el-col>
    </el-row>
    <el-row v-if="card.actions?.length" justify="end" class="action-row">
      <el-button
        v-for="(action, actionIdx) in card.actions"
        :key="'action' + actionIdx"
        type="text"
        size="large"
        :disabled="action.disabled?.value"
        @click="action.onClick"
      >
        {{ $t(action.label) }}
      </el-button>
    </el-row>
  </el-card>
</template>

<script setup lang="ts">
import type { DefinitionCards, DefinitionCardsVirtual } from '@/components/Shared/definition-card.types'
import type { PropType } from 'vue';
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import DefinitionCardItem from './DefinitionCardItem.vue'

const props = defineProps({
  dto: {
    type: Object as PropType<any>,
    required: true,
  },
  card: {
    type: Object as PropType<DefinitionCards<any, any> | DefinitionCardsVirtual<any, any>>,
    required: true,
  },
})

const dtoAccess = computed(() => (props.card.loopOn ? props.dto : props.dto[props.card.key]))
const route = useRoute()
const isPrint = route.matched.some((route) => route.name === 'PrintLayout')
</script>

<style lang="scss" scoped>
@import 'src/assets/sass/variable';
[role='term'] {
  font-weight: bold;
  color: $gray-900;
}

[role='definition'] {
  span {
    display: block;
    white-space: break-spaces;
  }

  span:not(:last-child) {
    margin-right: 0.3em;
  }

  span:first-letter,
  li:first-letter {
    text-transform: capitalize;
  }
}

.el-card:not(:last-child) {
  margin-bottom: 0.2em;
}

.el-row {
  gap: 0.5em 0;
}

.el-col:empty {
  display: none;
}

.action-row {
  margin-top: 1.5em;
}
</style>
