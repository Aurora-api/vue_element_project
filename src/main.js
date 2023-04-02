import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// 引入 element_ui
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

//全局守卫
import '@/permission'

//表单验证
import {rules} from "@/utils/rules"
Vue.prototype.rules = rules

Vue.use(ElementUI);
//阻止启动生产消息
Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
