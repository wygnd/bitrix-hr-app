import './assets/main.css'

import {createApp} from 'vue'
import b24UiPlugin from '@bitrix24/b24ui-nuxt/vue-plugin'
import App from './App.vue'

const params = new URLSearchParams(window.location.search)

const auth = params.get('member_id')

if (!auth || auth !== import.meta.env.VITE_BITRIX_TOKEN) throw Error('Forbidden');

const app = createApp(App)

app.use(b24UiPlugin)

app.mount('#app')
