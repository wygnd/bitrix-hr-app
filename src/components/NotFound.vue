<script setup lang="ts">

</script>

<template>
  <B24Error
      :clear="false"
      :error="{
      statusCode: 404,
      statusMessage: 'Страница не найдена',
      message: 'Страница, которую вы ищете, не существует.'
    }"/>
</template>

<style scoped>

</style>