import { createApp } from 'vue'
import 'element-plus/es/components/message/style/css'
import 'element-plus/es/components/message-box/style/css'

import App from './App.vue'
import { createPinia } from 'pinia'
import ComponentWrapper from '@/components/common/ComponentWrapper.vue'
import PageWrapper from '@/components/common/PageWrapper.vue'
import { FontAwesomeIcon } from '@/plugins/fontAwesome'
import i18n from '@/i18n'
import router from '@/router'
import { useAuthStore } from '@/stores/useAuthStore'
import { useThemeStore } from '@/stores/useThemeStore'
import './styles/tailwind.css'
import './styles/main.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(i18n)
app.use(router)

const themeStore = useThemeStore(pinia)
themeStore.initTheme()

app.component('ComponentWrapper', ComponentWrapper)
app.component('component-wrapper', ComponentWrapper)
app.component('PageWrapper', PageWrapper)
app.component('page-wrapper', PageWrapper)
app.component('FontAwesomeIcon', FontAwesomeIcon)
app.component('font-awesome-icon', FontAwesomeIcon)

const authStore = useAuthStore(pinia)
authStore.initialize().finally(() => {
  app.mount('#app')
})
