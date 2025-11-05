<script setup lang="ts">
import Vacancies from './components/vacancies.vue';
import {ref} from "vue";

const isInit = ref<boolean>(true);

</script>

<template>
  <B24App v-if="isInit">
    <B24Container>
      <Vacancies/>
    </B24Container>
  </B24App>
</template>
