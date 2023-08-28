import { RouteRecordRaw } from 'vue-router'

export const ROUTER_NAMES = {
  LOGIN: 'login',
  HOME: 'home',
  CLIENTS: 'clientes',
  TIMES: 'tiempos',
  PASSWORDS: 'claves',
  USERS: 'usuarios',
  SETTINGS: 'configuraciones',
  PAYMENT_OF_FEES: 'honorarios',
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
      {
        path: 'clientes',
        name: ROUTER_NAMES.CLIENTS,
        component: () => import('pages/ClientsPage.vue'),
      },
      {
        path: 'tiempos',
        name: ROUTER_NAMES.TIMES,
        component: () => import('pages/TimesPage.vue'),
      },
      {
        path: 'honorarios',
        name: ROUTER_NAMES.PAYMENT_OF_FEES,
        component: () => import('pages/FeesPage.vue'),
      },
      {
        path: 'claves',
        name: ROUTER_NAMES.PASSWORDS,
        component: () => import('pages/PasswordsPage.vue'),
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
