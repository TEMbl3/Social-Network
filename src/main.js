import { createApp } from 'vue';
import App from './App.vue';
import VueCookies from 'vue-cookies';
import { autoAnimatePlugin } from '@formkit/auto-animate/vue'

const app = createApp(App);
app.use(VueCookies);
app.use(autoAnimatePlugin)
app.mount('#app');