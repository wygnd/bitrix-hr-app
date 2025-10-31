<script setup lang="ts">
import {onMounted, ref} from 'vue'
import axios from 'axios'
import type {DescriptionListItem} from '@bitrix24/b24ui-nuxt'

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
    const {data} = await axios.get<IVacancy[]>(import.meta.env.VITE_BACKEND_API_URL + 'headhunter/vacancies/active', {
      headers: {
        'Authorization': `bga ${import.meta.env.VITE_BACKEND_API_TOKEN}`
      }
    });

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