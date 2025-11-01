<script setup lang="ts">
import {defineProps, withDefaults} from 'vue';

const props = withDefaults(defineProps<{
  title: string;
  description?: string;
  visibility: boolean;
}>(), {
  description: ''
});

const closeAlert = () => props.visibility = false;

</script>

<template>
  <B24Alert
      :title="title"
      :description="description"
      :close="{
        color: 'air-secondary-accent-2',
        class: 'rounded-full',
        onClick: closeAlert
      }"
      v-if="visibility"
  />
</template>

<style scoped>

</style>