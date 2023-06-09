// Composables
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/default/Default.vue'),
    children: [
      {
        path: '',
        name: 'Devices',
        component: () => import('@/views/Devices.vue'),
      },
      {
        path: 'notifications',
        name: 'Notifications',
        component: () => import('@/views/Notifications.vue'),
      },
      {
        path: 'simcards',
        name: 'SimCards',
        component: () => import('@/views/SimCards.vue'),
      },
      {
        path: 'sdcards',
        name: 'SdCards',
        component: () => import('@/views/SdCards.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router
