import { RouteRecordRaw } from 'vue-router'

export const ROUTER_NAMES = {
  LOGIN: 'login',
  HOME: 'home',
}

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: ROUTER_NAMES.LOGIN,
    component: () => import('pages/LoginSB.vue'),
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: ROUTER_NAMES.HOME,
        component: () => import('pages/IndexPage.vue'),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
