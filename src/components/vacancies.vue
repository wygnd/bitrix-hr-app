<script setup lang="ts">
import {onMounted, ref} from 'vue'
import type {DescriptionListItem} from '@bitrix24/b24ui-nuxt'
import {API} from "../assets/api.ts";

const items = ref<DescriptionListItem[]>([]);

interface IVacancy {
  id: string;
  name: string;
  alternate_url: string;
}

onMounted(() => {
  fetchVacancies();
})

const fetchVacancies = async () => {
  try {
    const {data} = await API.get<IVacancy[]>('headhunter/vacancies/active');

    data.forEach((vacancy) => {
      items.value.push({
        label: vacancy.name,
        description: vacancy.alternate_url,
      });
    })

  } catch (error) {
    console.log('EXECUTION ERROR: ', error);
  }

}

</script>

<template>
  <B24DescriptionList :items="items"/>
</template>

<style scoped>

</style>