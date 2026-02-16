// src/plugins/vuetify.js
// This imports all Vuetify 3 styles
import 'vuetify/styles'  
import { createVuetify } from 'vuetify'
import '@mdi/font/css/materialdesignicons.css'

// Optional: you can import specific components/directives for tree-shaking
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

export default createVuetify({
  components,
  directives,
  icons: {
    iconfont: 'mdi', // default - ensures Vuetify uses @mdi/font
  },
  // Optional: define your theme here
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
          warning: '#FB8C00',
        },
      },
    },
  },
})
