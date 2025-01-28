<script setup lang="ts">
import PlayCircleIcon from '@bitrix24/b24icons-vue/main/PlayCircleIcon'
</script>

<template>
  <B24App>
    <div class="flex flex-col items-center justify-center gap-16 h-screen">
      <h1 class="font-b24-secondary text-8xl font-light">
        Bitrix24 UI - Vue Playground
      </h1>

      <div class="flex items-center gap-2">
        <B24Button
          rounded
          label="Documentation"
          color="ai"
          :icon="PlayCircleIcon"
          to="https://bitrix24.github.io/b24ui/guide/installation-vue.html"
          target="_blank"
        />

        <B24Button
          rounded
          label="GitHub"
          to="https://github.com/bitrix24/b24ui"
          target="_blank"
        />
      </div>
    </div>
  </B24App>
</template>
