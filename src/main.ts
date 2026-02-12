import { createApp } from 'vue';
import PrimeVue from 'primevue/config';
import Lara from '@primeuix/themes/lara';
import ToastService from 'primevue/toastservice';

import { VueQueryPlugin } from '@tanstack/vue-query'

import App from './app/App.vue';
import router from './app/router';

import './index.css';

const app = createApp(App)

app.use(router)

app.use(VueQueryPlugin);

app.use(PrimeVue, {
  theme: {
    preset: Lara
  },
});

app.use(ToastService);

app.mount('#app')
