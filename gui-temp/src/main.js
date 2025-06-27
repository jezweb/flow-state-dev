import { createApp } from 'vue'
import { createPinia } from 'pinia'

// Vuetify
import { createVuetify } from 'vuetify'
import 'vuetify/styles'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

import App from './App.vue'
import router from './router'
import { errorHandler } from './utils/errorHandler'

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#1976D2',
          secondary: '#424242',
          accent: '#82B1FF',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FFC107'
        }
      }
    }
  }
})

const app = createApp(App)

// Initialize error handling
errorHandler.init(app)

const pinia = createPinia()
app.use(pinia)
app.use(router)
app.use(vuetify)

// Connect error handler to notifications after store is available
import { useNotificationsStore } from './stores/notifications'
errorHandler.setNotificationsStore(useNotificationsStore(pinia))

app.mount('#app')