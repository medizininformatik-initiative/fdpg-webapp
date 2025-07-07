<template>
  <router-view />
</template>

<script setup lang="ts"></script>

<style lang="scss">
@page {
  margin: 1cm 1cm 1cm 1.5cm;
}

h2:not(:first-of-type):not(.ql-editor h2) {
  break-before: page;
}

.print-region:not(.ql-editor .print-region) {
  break-inside: avoid;
}

h1:not(.ql-editor h1),
h2:not(.ql-editor h2),
h3:not(.ql-editor h3),
h4:not(.ql-editor h4),
h5:not(.ql-editor h5) {
  span:not(:last-child):after {
    content: ' ';
  }
}
</style>
