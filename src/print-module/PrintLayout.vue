<template>
  <router-view />
</template>

<script setup lang="ts"></script>

<style lang="scss">
body {
  counter-reset: h2 h3 h4;
}

@page {
  margin: 1cm 1cm 1cm 1.5cm;
}

h1 {
  counter-reset: h2;
}

h2 {
  counter-reset: h3;
}

h3 {
  counter-reset: h4;
}

h2::before {
  counter-increment: h2;
  content: counter(h2) '. ';
}

h3::before {
  counter-increment: h3;
  content: counter(h2) '.' counter(h3) '. ';
}

h4::before {
  counter-increment: h4;
  content: counter(h2) '.' counter(h3) '.' counter(h4) '. ';
}

h2:not(:first-of-type) {
  break-before: page;
}

.print-region {
  break-inside: avoid;
}

h1,
h2,
h3,
h4,
h5 {
  span:not(:last-child):after {
    content: ' ';
  }
}
</style>
