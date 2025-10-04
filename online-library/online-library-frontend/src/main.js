import { createApp } from 'vue';
import App from './App.vue';
import router from './router/index.js';
import { createPinia } from 'pinia';
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { useAuthStore } from './store/auth.js'

const vuetify = createVuetify({ components, directives });

const app = createApp(App);
app.use(router);
app.use(createPinia());
app.use(vuetify);
app.mount('#app');

const authStore = useAuthStore()
authStore.restoreSession()