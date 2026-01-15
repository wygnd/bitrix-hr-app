<script setup lang="ts">
import {onMounted, ref} from 'vue'
import {API} from "../assets/api.ts";
import {BITRIX_VACANCIES_KEY} from "../common/config.ts";
import type {SelectMenuItem} from '@bitrix24/b24ui-nuxt'
import TrashcanIcon from '@bitrix24/b24icons-vue/outline/TrashcanIcon'
import CheckIcon from '@bitrix24/b24icons-vue/main/CheckIcon'
import CrossIcon from '@bitrix24/b24icons-vue/actions/Cross50Icon'
import axios from "axios";

const fieldBitrixItems = ref<SelectMenuItem[]>([]);
const vacancies = ref<IVacancy[]>([]);
const targetVacancies = ref<Record<string, SelectMenuItem | null>>({});
const toast = useToast();

type IVacancyItem = {
  id: string;
  value: string;
}

interface IVacancy {
  id: number;
  vacancyId: string;
  label: string;
  url: string;
  bitrixField: IVacancyItem | null;
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

interface IVacancyUpdate {
  id: number,
  fields: Partial<IVacancy>
}

const initComponent = async () => {
  try {
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
  } catch (e) {
    toast.add({
      title: 'Ошибка обновления',
      description: `${e}`,
      icon: CrossIcon,
      color: 'air-primary-success'
    })
  }
}

onMounted(initComponent)

const fetchVacanciesFromHH = async () => {
  const {data} = await API.get<IVacancy[]>('integration/headhunter/vacancies');
  return data;
}

const fetchFieldItems = async (fieldId: string) => {
  const {data} = await API.get<IFieldItem>(`deals/fields/field/${fieldId}`);

  if (!data.items || data.items.length === 0) return [];

  return data.items
}

async function handleSubmitButton() {
  try {
    // Получаем оригиналиные вакансии
    const {value: originalVacancies} = vacancies;
    const vacanciesNeedUpdate: IVacancyUpdate[] = [];

    Object.entries(targetVacancies.value).forEach(([key, item]) => {
      if (!item) return;

      const vacancyIndex = originalVacancies.findIndex(({id}) => id == item!.vacancyId);

      if (vacancyIndex === -1) return;

      const originalVacancy = originalVacancies[vacancyIndex];

      if (originalVacancy.bitrixField?.id !== item!.value) {
        vacanciesNeedUpdate.push({
          id: Number(originalVacancy.id),
          fields: {
            bitrixField: {
              id: item!.value,
              value: item!.label,
            }
          }
        });
      }

      originalVacancies[vacancyIndex].bitrixField = {
        id: item!.value,
        value: item!.label,
      } as IVacancyItem;

      // clear items in select
      targetVacancies.value[key] = [];
    })

    if (vacanciesNeedUpdate.length === 0) {
      toast.add({
        title: 'Пожалуйста, измените вакансии, чтобы сохранить',
        icon: CheckIcon,
        color: 'air-primary-warning'
      })
      return;
    }
    const {data: wasSaved} = await API.patch<{
      status: boolean
    }>('integration/headhunter/vacancies/bulk/update', vacanciesNeedUpdate);

    if (!wasSaved.status) {
      toast.add({
        title: 'Возникла ошибка при сохранении',
        icon: CheckIcon,
        color: 'air-primary-alert'
      })
      return
    }

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

    toast.add({
      title: 'Изменения успешно сохранены',
      icon: CheckIcon,
      color: 'air-primary-success'
    })
  } catch (e) {
    toast.add({
      title: 'Непредвиденая ошибка сохранения',
      description: `${e}`,
      icon: CheckIcon,
      color: 'air-primary-alert'
    })
  }
}

function setVacancies(items: IVacancy[]) {
  vacancies.value = items;
}

function setFieldBitrixItems(items: IVacancyItem[]) {
  fieldBitrixItems.value = items.map(({ID, VALUE}) => ({
    label: VALUE,
    value: ID,
    color: 'air-primary'
  })) as SelectMenuItem[];
}

const handleClickClearTargetVacancies = (event: Event) => {
  const button = event?.target!.ownerDocument!.activeElement as HTMLButtonElement;

  if (!('vacancy' in button.dataset) || !button.dataset.vacancy) return;

  const vacancyId = button.dataset.vacancy;

  if (!(vacancyId in targetVacancies.value)) return;

  targetVacancies.value[vacancyId] = null;
}

const handleClickClearExistsVacancies = async (event: Event) => {
  try {
    const element = event.target as HTMLSpanElement

    if (!('vacancy' in element.dataset) || !element.dataset.vacancy) return;

    const vacancyId = element.dataset.vacancy;
    const vacancyRowId = element.dataset.row;

    const vacancyIndex = vacancies.value.findIndex(v => v.vacancyId === vacancyId);

    if (vacancyIndex === -1) {
      toast.add({
        title: 'Не удалось отчистить поле',
        icon: CheckIcon,
        color: 'air-primary-warning'
      })
      return
    }

    vacancies.value[vacancyIndex].bitrixField = null;

    const updateVacancyFields: IVacancyUpdate = {
      id: Number(vacancyRowId),
      fields: {
        bitrixField: null
      }
    };

    await API.patch<{
      status: boolean
    }>(`integration/headhunter/vacancies/${vacancyId}`, updateVacancyFields);

    toast.add({
      title: 'Вакансия обновлена',
      icon: CheckIcon,
      color: 'air-primary-success'
    })
  } catch (e) {
    toast.add({
      title: 'Ошибка изменения вакансии',
      description: `${e}`,
      icon: CheckIcon,
      color: 'air-primary-alert'
    })
  }
}

async function reinitComponent() {
  try {
    localStorage.removeItem(BITRIX_VACANCIES_KEY);

    await initComponent();

    toast.add({
      title: 'Изменения успешно обновлены',
      icon: CheckIcon,
      color: 'air-primary-success'
    })
    return true;
  } catch (e) {
    toast.add({
      title: 'Ошибка восстановлении данных',
      description: `${e}`,
      icon: CheckIcon,
      color: 'air-primary-alert'
    });
  }
}
</script>

<template>
  <section class="pt-1 pb-10" v-if="vacancies.length > 0">
    <h1 class="mb-6 text-4xl font-extrabold leading-none tracking-tight  md:text-5xl lg:text-6xl dark:text-white text-center">
      Вакансии
    </h1>
    <ul class="grid grid-cols-3 gap-2.5">
      <li v-for="({id, vacancyId, url, label, bitrixField}) in vacancies" :id="id.toString()"
          class="flex flex-col w-full items-start justify-between gap-5 p-3 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <div class="">
          <a
              :href="url"
              target="_blank"
              class="font-medium text-blue-6 dark:text-blue-500 hover:underline"
              title="Перейти к вакансии на hh.ru">
            {{ label }}
          </a>
          <ul v-if="bitrixField"
              class="mt-2 flex flex-wrap items-center gap-2 gap-y-0.5 text-black dark:text-white">
            <li class="text-base font-bold">Выбрано:</li>
            <li :id="bitrixField.id" class="text-base text-black ">
              {{ bitrixField.value }}
            </li>
            <li class="text-base font-bold w-full">
              <span class="underline cursor-pointer hover:text-red transition-colors" :data-row="id"
                    :data-vacancy="vacancyId"
                    @click="handleClickClearExistsVacancies">Отчистить</span>
            </li>
          </ul>

        </div>
        <div class="flex items-center justify-between gap-2 relative w-full" id="check">
          <B24SelectMenu
              :id="id.toString()"
              v-model="targetVacancies[id]"
              :items="fieldBitrixItems.map(vacancy => ({...vacancy, vacancyId: id}))"
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
              :disabled="!(id in targetVacancies)"
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