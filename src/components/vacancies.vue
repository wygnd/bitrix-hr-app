<script setup lang="ts">
import {onMounted, ref} from 'vue'
import {API} from "../assets/api.ts";
import {BITRIX_VACANCIES_KEY} from "../common/config.ts";

const vacancies = ref<IVacancy[]>([]);


interface IVacancy {
  id: string;
  name: string;
  alternate_url: string;
}


onMounted(() => {
  const vacanciesFromLocalStorage = localStorage.getItem(BITRIX_VACANCIES_KEY);

  if (vacanciesFromLocalStorage) {
    vacancies.value = JSON.parse(vacanciesFromLocalStorage) as IVacancy[];
    return;
  }
  fetchVacanciesFromHH();
})

const fetchVacanciesFromHH = async () => {
  try {
    const {data} = await API.get<IVacancy[]>('headhunter/vacancies/active');

    vacancies.value = data;

    localStorage.setItem(BITRIX_VACANCIES_KEY, JSON.stringify(data));

  } catch (error) {
    console.log('EXECUTION ERROR: ', error);
  }

}

</script>

<template>
  <ul v-if="vacancies.length > 0">
<!--    <li v-for="vacancy in vacancies" :id="vacancy.id">-->
<!--      <a :href="vacancy.alternate_url">{{ vacancy.name }}</a>-->
<!--      <B24SelectMenu v-model="targetVacancy" :items="vacancies" :id="targetVacancy + vacancy.id"/>-->
<!--    </li>-->
  </ul>
</template>

<style scoped>

</style>