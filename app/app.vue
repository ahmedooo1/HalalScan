<script setup lang="ts">
const { dir, locale } = useI18n()

useHead({
  htmlAttrs: {
    dir,
    lang: computed(() => locale.value),
  },
})
</script>

<template>
  <div class="min-h-screen bg-ink" :dir="dir">
    <NuxtPage />
  </div>
</template>
