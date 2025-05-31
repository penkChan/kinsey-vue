import '@/styles/index.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useGlobalEventsStore } from '@/stores/global-events'
import { MobileBarHeight } from '@/utils/MobileBarHeight'

const app = createApp(App)

app.use(createPinia())
app.use(router)

const globalEventsStore = useGlobalEventsStore()
new MobileBarHeight(globalEventsStore.mergedAllResizeEventSubject$)
app.mount('#app')
