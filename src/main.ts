import './assets/main.css'

import {createApp} from 'vue'
import b24UiPlugin from '@bitrix24/b24ui-nuxt/vue-plugin'
import App from './App.vue'
import NotFound from "./components/NotFound.vue";
import {createRouter, createWebHistory} from "vue-router";
import Vacancies from "./components/vacancies.vue";

const params = new URLSearchParams(window.location.search)

const auth = params.get('member_id')

let routes = [
	{path: '/not-found', component: NotFound},
];

if (!auth || auth !== import.meta.env.VITE_BITRIX_TOKEN) {
	routes.push({path: '/', component: NotFound});
} else {
	routes.push({path: '/', component: Vacancies},);
}

const router = createRouter({
	history: createWebHistory('/hr-app'),
	routes: routes,
})

const app = createApp(App)

app.use(router)
app.use(b24UiPlugin)

app.mount('#app')
