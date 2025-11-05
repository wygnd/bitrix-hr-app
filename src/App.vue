<script setup lang="ts">
import Vacancies from './components/vacancies.vue';
import {B24Frame, initializeB24Frame} from '@bitrix24/b24jssdk'
import {computed, onMounted, onUnmounted} from "vue";

let $b24: B24Frame
const isInit = computed(() => $b24?.isInit);

onMounted(async () => {
  try {
    $b24 = await initializeB24Frame()
  } catch (error) {
    console.error(error)
  }
})

onUnmounted(() => {
  $b24?.destroy()
})

</script>

<template>
  <B24App v-if="isInit">
    <B24Container>
      <Vacancies/>
    </B24Container>
  </B24App>
</template>
