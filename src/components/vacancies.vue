<script setup lang="ts">
import {onMounted, ref} from 'vue'
import {API} from "../assets/api.ts";
import {BITRIX_VACANCIES_KEY} from "../common/config.ts";
import type {SelectMenuItem} from '@bitrix24/b24ui-nuxt'

const fieldBitrixItems = ref<SelectMenuItem[]>([]);
const vacancies = ref<IVacancy[]>([]);
const targetVacancies = ref<Record<string, SelectMenuItem[]>>({});

type IVacancyItem = {
  ID: string;
  VALUE: string;
}

interface IVacancy {
  id: string;
  label: string;
  url: string;
  items: IVacancyItem[];
}

interface IFieldItem {
  type: string;
  isRequired: boolean;
  isReadOnly: boolean;
  isImmutable: boolean;
  isMultiple: boolean;
  isDynamic: boolean;
  items?: IVacancyItem[];
  title: string;
  listLabel: string;
  formLabel: string;
  filterLabel: string;
  settings: Record<string, any>;
}

interface IVacanciesStorage {
  expires: number;
  fieldItems: IVacancyItem[];
  vacancies: IVacancy[];
}

const initComponent = async () => {
  const vacanciesFromLocalStorage = localStorage.getItem(BITRIX_VACANCIES_KEY);
  const now = new Date();

  if (vacanciesFromLocalStorage) {
    const {
      vacancies: storageVacancies,
      fieldItems: storageFieldItems,
      expires
    } = JSON.parse(vacanciesFromLocalStorage) as IVacanciesStorage;

    if (new Date(expires) > now) {
      setVacancies(storageVacancies);
      setFieldBitrixItems(storageFieldItems)
      return;
    }

  }

  const vacanciesFromBackend = await fetchVacanciesFromHH();
  const fieldItemsFromBackend = await fetchFieldItems("UF_CRM_1638524000");


  if (vacanciesFromBackend && vacanciesFromBackend.length > 0 && fieldItemsFromBackend && fieldItemsFromBackend.length > 0) {
    localStorage.setItem(BITRIX_VACANCIES_KEY, JSON.stringify({
      fieldItems: fieldItemsFromBackend,
      vacancies: vacanciesFromBackend,
      expires: now.setDate(now.getDate() + 1),
    } as IVacanciesStorage));

    setVacancies(vacanciesFromBackend);
    setFieldBitrixItems(fieldItemsFromBackend)
  }
}

onMounted(initComponent)

const fetchVacanciesFromHH = async () => {
  try {
    const {data} = await API.get<IVacancy[]>('integration/headhunter/vacancies');
    return data;
  } catch (error) {
    console.log('EXECUTION ERROR: ', error);
  }
}

const fetchFieldItems = async (fieldId: string) => {
  try {
    const {data} = await API.get<IFieldItem>(`deals/fields/field/${fieldId}`);

    if (!data.items || data.items.length === 0) return [];

    return data.items
  } catch (error) {
    console.log('EXECUTION ERROR: ', error);
  }
}

async function handleSubmitButton() {
  const originalVacanciesDecoded = localStorage.getItem(BITRIX_VACANCIES_KEY);

  if (!originalVacanciesDecoded) return void alert('Не удалось отправить форму');

  const originalVacanciesStorage = JSON.parse(originalVacanciesDecoded) as IVacanciesStorage;

  const {vacancies: originalVacancies, expires, fieldItems} = originalVacanciesStorage;

  Object.entries(targetVacancies.value).forEach(([key, items]) => {
    const vacancyIndex = originalVacancies.findIndex(({id}) => id === key);

    if (vacancyIndex === -1) return;

    originalVacancies[vacancyIndex].items = items.map((item): SelectMenuItem => ({
      ID: item!.value,
      VALUE: item!.label,
    })) as IVacancyItem[];
  })


  const {data} = await API.post<boolean>('integration/headhunter/vacancies', originalVacancies, {
    headers: {
      "Content-Type": 'application/json',
    }
  });

  if (data) {
    localStorage.setItem(BITRIX_VACANCIES_KEY, JSON.stringify({
      vacancies: originalVacancies,
      expires: expires,
      fieldItems: fieldItems
    } as IVacanciesStorage));

    setVacancies(originalVacancies);
    setFieldBitrixItems(fieldItems)
  }

  return data;
}

function setVacancies(items: IVacancy[]) {
  vacancies.value = items;
}

function setFieldBitrixItems(items: IVacancyItem[]) {
  fieldBitrixItems.value = items.map(({ID, VALUE}) => ({
    label: VALUE,
    value: ID,
    color: 'air-primary',
  })) as SelectMenuItem[];
}

async function reinitComponent() {
  localStorage.removeItem(BITRIX_VACANCIES_KEY);

  await initComponent();
}

</script>

<template>
  <section class="pt-1 pb-10" v-if="vacancies.length > 0">
    <h1 class="mb-6 text-4xl font-extrabold leading-none tracking-tight  md:text-5xl lg:text-6xl dark:text-white text-center">
      Вакансии</h1>
    <ul>
      <li v-for="({id, url, label, items}) in vacancies" :id="id"
          class="mb-2 flex w-full justify-between gap-10 p-3 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <div>
          <a :href="url" target="_blank" class="font-medium text-blue-6  dark:text-blue-500 hover:underline">{{
              label
            }}</a>
          <ul v-if="items.length > 0"
              class="mt-2 flex flex-wrap items-center gap-2 gap-y-0.5 text-gray-900 dark:text-white">
            <li class="text-base">Выбрано:</li>
            <li v-for="({ID, VALUE}) in items" :id="ID" class="text-base">
              {{ VALUE }}
            </li>
          </ul>

        </div>
        <B24SelectMenu
            :id="id"
            v-model="targetVacancies[id]"
            :items="fieldBitrixItems.map(vacancy => ({...vacancy, vacancyId: id}))"
            multiple
            placeholder="Выберите вакансии"
            color="air-primary"
            highlight
            size="md"
            class="w-[180px]"
        />
      </li>
    </ul>
    <div class="flex justify-between">
      <B24Button class="w-3/12" size="xl" color="air-primary" loading-auto @click="handleSubmitButton">
        Сохранить
      </B24Button>
      <B24Button class="w-3/12" size="xl" color="air-selection" @click="reinitComponent">
        Обновить
      </B24Button>
    </div>
  </section>
</template>

<style scoped>

</style>