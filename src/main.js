// src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import vuetify from './plugins/vuetify';
import 'sweetalert2/dist/sweetalert2.min.css';
import sweetalert2 from 'vue-sweetalert2';
import store from './store';
import apiBaseUrl from './apiBaseUrl';

const app = createApp(App);

app.config.globalProperties.$apiBaseUrl = apiBaseUrl //GLOBAL PROPERTY

app.use(router);
app.use(vuetify);
app.use(store);
app.use(sweetalert2);

app.mount('#app');
