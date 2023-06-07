import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from '@/router'
import { i18n } from '@/plugins/i18n'

import 'element-plus/theme-chalk/index.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './fonts.css'
import './assets/sass/style.scss'
import { initAuthPlugin } from './plugins/auth/auth.plugin'

const main = async () => {
  const app = createApp(App)
  const pinia = createPinia()

  const authPlugin = await initAuthPlugin(router)

  pinia.use(() => ({ $oidc: authPlugin.mainOidc }))
  app.use(authPlugin).use(i18n).use(router).use(pinia)
  app.mount('#app')
}

;(async () => await main())()
