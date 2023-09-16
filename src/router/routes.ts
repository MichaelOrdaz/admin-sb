import { RouteRecordRaw } from 'vue-router'

export const ROUTER_NAMES = {
  LOGIN: 'login',
  HOME: 'home',
  CLIENTS_LIST: 'clientes_listado',
  CLIENTS_NEW: 'clientes_nuevo',
  CLIENTS_DETAILS: 'clientes_detalle',
  CLIENTS_EDIT: 'clientes_edicion',
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
        name: ROUTER_NAMES.CLIENTS_LIST,
        component: () => import('pages/clients/ClientsListPage.vue'),
      },
      {
        path: 'clientes/nuevos',
        name: ROUTER_NAMES.CLIENTS_NEW,
        component: () => import('pages/clients/ClientsCreatePage.vue'),
      },
      {
        path: 'clientes/:clientId(\\d+)',
        name: ROUTER_NAMES.CLIENTS_DETAILS,
        component: () => import('pages/clients/ClientsDetailsPage.vue'),
      },
      {
        path: 'clientes/:clientId(\\d+)/edicion',
        name: ROUTER_NAMES.CLIENTS_EDIT,
        component: () => import('pages/clients/ClientsEditPage.vue'),
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
