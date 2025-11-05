<script setup lang="ts">
import Vacancies from './components/vacancies.vue';
import {B24Frame, initializeB24Frame} from '@bitrix24/b24jssdk'
import {onMounted, onUnmounted, ref} from "vue";

let $b24: B24Frame
const isInit = ref<boolean>(false);

onMounted(async () => {
  try {
    $b24 = await initializeB24Frame()
    isInit.value = true
  } catch (error) {
    console.error(error)
    isInit.value = false
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
