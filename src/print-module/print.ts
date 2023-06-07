import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import AppPrint from '../App-Print.vue'
import router from './router'
import { i18n } from '@/plugins/i18n'

import 'element-plus/theme-chalk/index.css'
// In case Icons are needed
// import '@fortawesome/fontawesome-free/css/all.min.css'
// import 'bootstrap-icons/font/bootstrap-icons.css'
import '../fonts.css'
import '../assets/sass/style.scss'

const main = async () => {
  const app = createApp(AppPrint)

  app.use(i18n).use(router).use(ElementPlus)
  app.mount('#app')
}

;(async () => await main())()
