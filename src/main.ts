import './assets/main.css'

import {createApp} from 'vue'
import b24UiPlugin from '@bitrix24/b24ui-nuxt/vue-plugin'
import App from './App.vue'
import {initializeB24Frame} from '@bitrix24/b24jssdk'

initializeB24Frame().then(res => {
    const $b24 = res;

    const app = createApp(App)

    app.use(b24UiPlugin)

    app.mount('#app')
})
