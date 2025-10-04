import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'

const Home = { template: '<div>Home</div>' }
const About = { template: '<div>About</div>' }

// 为 routes 数组指定类型
const routes: Array<RouteRecordRaw> = [
  { path: '/', component: Home },
  { path: '/about', component: About }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
