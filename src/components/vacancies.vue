<script setup lang="ts">
import {onMounted, ref} from 'vue'
import {API} from "../assets/api.ts";
import {BITRIX_VACANCIES_KEY} from "../common/config.ts";
import type {SelectMenuItem} from '@bitrix24/b24ui-nuxt'
import TrashcanIcon from '@bitrix24/b24icons-vue/outline/TrashcanIcon'

const fieldBitrixItems = ref<SelectMenuItem[]>([]);
const vacancies = ref<IVacancy[]>([]);
const targetVacancies = ref<Record<string, SelectMenuItem[]>>({});
const isAlert = ref<boolean>(false);

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

    if (new Date(expires) > now && storageVacancies.length > 0 && storageFieldItems.length > 0) {
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
  const {value: originalVacancies} = vacancies;

  Object.entries(targetVacancies.value).forEach(([key, items]) => {
    if (items.length === 0) return;

    const vacancyIndex = originalVacancies.findIndex(({id}) => id === key);

    if (vacancyIndex === -1) return;

    originalVacancies[vacancyIndex].items = items.map((item): SelectMenuItem => ({
      ID: item!.value,
      VALUE: item!.label,
    })) as IVacancyItem[];

    // clear items in select
    targetVacancies.value[key] = [];
  })


  const {data: wasSaved} = await API.post<boolean>('integration/headhunter/vacancies', originalVacancies);

  if (!wasSaved) return;

  const originalVacanciesDecoded = localStorage.getItem(BITRIX_VACANCIES_KEY);
  let expires = Date.now();
  let fieldItems: IVacancyItem[] = [];

  if (originalVacanciesDecoded) {
    const originalVacanciesStorage = JSON.parse(originalVacanciesDecoded) as IVacanciesStorage;

    expires = originalVacanciesStorage.expires;
    fieldItems = originalVacanciesStorage.fieldItems;
  }


  localStorage.setItem(BITRIX_VACANCIES_KEY, JSON.stringify({
    vacancies: originalVacancies,
    expires: expires,
    fieldItems: fieldItems
  } as IVacanciesStorage));

  setVacancies(originalVacancies);
  setFieldBitrixItems(fieldItems)
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

const handleClickClearTargetVacancies = (event: Event) => {
  const button = event?.target!.ownerDocument!.activeElement as HTMLButtonElement;

  if (!('vacancy' in button.dataset) || !button.dataset.vacancy) return;

  const vacancyId = button.dataset.vacancy;

  if (!(vacancyId in targetVacancies.value)) return;

  targetVacancies.value[vacancyId] = [];
}

const handleClickClearExistsVacancies = (event: Event) => {
  const element = event.target as HTMLSpanElement

  if (!('vacancy' in element.dataset) || !element.dataset.vacancy) return;

  const vacancyId = element.dataset.vacancy;

  const vacancyIndex = vacancies.value.findIndex(v => v.id === vacancyId);

  if (vacancyIndex === -1) return;

  vacancies.value[vacancyIndex].items = [];
}

async function reinitComponent() {
  localStorage.removeItem(BITRIX_VACANCIES_KEY);

  await initComponent();
  isAlert.value = true;
  setTimeout(() => {
    isAlert.value = false;
  }, 3000)

  return true;
}

</script>

<template>
  <section class="pt-1 pb-10" v-if="vacancies.length > 0">
    <h1 class="mb-6 text-4xl font-extrabold leading-none tracking-tight  md:text-5xl lg:text-6xl dark:text-white text-center">
      Вакансии
    </h1>
    <ul class="grid grid-cols-3 gap-2.5">
      <li v-for="({id, url, label, items}) in vacancies" :id="id"
          class="flex flex-col w-full items-start justify-between gap-10 p-3 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <div class="">
          <a
              :href="url"
              target="_blank"
              class="font-medium text-blue-6 dark:text-blue-500 hover:underline"
              title="Перейти к вакансии на hh.ru">
            {{ label }}
          </a>
          <ul v-if="items.length > 0"
              class="mt-2 flex flex-wrap items-center gap-2 gap-y-0.5 text-black dark:text-white">
            <li class="text-base font-bold">Выбрано:</li>
            <li v-for="({ID, VALUE}) in items" :id="ID" class="text-base text-black ">
              {{ VALUE }}
            </li>
            <li class="text-base font-bold w-full">
              <span class="underline cursor-pointer hover:text-red transition-colors" :data-vacancy="id"
                    @click="handleClickClearExistsVacancies">Очистить</span>
            </li>
          </ul>

        </div>
        <div class="flex items-center justify-between gap-2 relative w-full" id="check">
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
              title="Выбрать новые вакансии"
          />
          <B24Button
              title="Очистить"
              :data-vacancy="id"
              id="clear-target-vacancies"
              @click="handleClickClearTargetVacancies"
              :icon="TrashcanIcon"
              :disabled="!(targetVacancies[id]?.length > 0)"
              color="air-secondary-alert"
          />
        </div>
      </li>
    </ul>
    <div class="flex justify-between mt-10">
      <B24Button class="w-3/12" size="xl" color="air-primary" loading-auto @click="handleSubmitButton">
        Сохранить
      </B24Button>
      <B24Button class="w-3/12" size="xl" color="air-selection" loading-auto @click="reinitComponent">
        Обновить
      </B24Button>
    </div>
  </section>

</template>

<style scoped>

</style>