<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import LayoutMain from './layout/main.vue'
import LayoutPage from './layout/page.vue'
import LayoutSlider from './layout/slider.vue'

const route = useRoute()

const layout = computed(() =>
{
  if (route.path === '/') {
    return LayoutMain
  }
  
  if (route.path.includes('slider')) {
    return LayoutSlider
  }
  
  if (route.path.includes('slider')) {
    return LayoutSlider
  }
  
  return LayoutPage
})
</script>

<template>
  <B24App>
    <Component :is="layout">
      <RouterView/>
    </Component>
  </B24App>
</template>
