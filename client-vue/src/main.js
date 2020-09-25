import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify';
import VueSocketIO from 'vue-socket.io'
import {apiUrl} from './api-config'


Vue.config.productionTip = false

Vue.use(new VueSocketIO({
  debug: true,
  connection: `${apiUrl}`,
  vuex: {
      store,
      actionPrefix: 'SOCKET_',
      mutationPrefix: 'SOCKET_'
  },
  options: { transports: ["websocket"] } //Optional options
}))

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
