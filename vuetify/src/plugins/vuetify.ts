import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'

// Import Material Design Icons
import {
  mdiAccount,
  mdiEmail,
  mdiLock,
  mdiMenu,
  mdiHome,
  mdiInformation,
  mdiChevronDown,
  mdiMagnify,
  mdiHeart,
  mdiPlus
} from '@mdi/js'

// Custom theme configuration
const lightTheme = {
  dark: false,
  colors: {
    primary: '#1976D2',
    'primary-darken-1': '#1565C0',
    secondary: '#424242',
    'secondary-darken-1': '#303030',
    accent: '#82B1FF',
    error: '#FF5252',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FFC107',
    background: '#FFFFFF',
    surface: '#FFFFFF',
    'on-surface': '#000000',
    'on-primary': '#FFFFFF',
    'on-secondary': '#FFFFFF'
  }
}

const darkTheme = {
  dark: true,
  colors: {
    primary: '#2196F3',
    'primary-darken-1': '#1976D2',
    secondary: '#616161',
    'secondary-darken-1': '#424242',
    accent: '#FF4081',
    error: '#FF5252',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FFC107',
    background: '#121212',
    surface: '#212121',
    'on-surface': '#FFFFFF',
    'on-primary': '#000000',
    'on-secondary': '#FFFFFF'
  }
}

export default createVuetify({
  theme: {
    defaultTheme: 'lightTheme',
    themes: {
      lightTheme,
      darkTheme
    }
  },
  icons: {
    defaultSet: 'mdi',
    aliases: {
      ...aliases,
      account: mdiAccount,
      email: mdiEmail,
      lock: mdiLock,
      menu: mdiMenu,
      home: mdiHome,
      information: mdiInformation,
      chevronDown: mdiChevronDown,
      magnify: mdiMagnify,
      heart: mdiHeart,
      plus: mdiPlus
    },
    sets: {
      mdi,
    },
  },
  defaults: {
    VBtn: {
      color: 'primary',
      variant: 'elevated',
      rounded: 'lg'
    },
    VCard: {
      elevation: 2,
      rounded: 'lg'
    },
    VTextField: {
      variant: 'outlined',
      color: 'primary'
    },
    VSelect: {
      variant: 'outlined',
      color: 'primary'
    },
    VTextarea: {
      variant: 'outlined',
      color: 'primary'
    }
  }
})