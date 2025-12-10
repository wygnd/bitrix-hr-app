<script setup lang="ts">
import {ref} from "vue";

const isInit = ref<boolean>(true);

</script>

<template>
  <B24App v-if="isInit">
    <B24Container>
      <RouterView/>
    </B24Container>
  </B24App>
</template>
