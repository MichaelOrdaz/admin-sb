import { RouteRecordRaw } from 'vue-router'

export const ROUTER_NAMES = {
  LOGIN: 'login',
  HOME: 'home',
  CLIENTS_LIST: 'clientes_listado',
  CLIENTS_NEW: 'clientes_nuevo',
  CLIENTS_DETAILS: 'clientes_detalle',
  CLIENTS_EDIT: 'clientes_edicion',
  CLIENTS_CODES_DETAILS: 'clientes_detalle_codigos',
  CLIENTS_CODES_EDIT_SAT: 'clientes_editar_codigos_sat',
  CLIENTS_CODES_EDIT_IMSS: 'clientes_editar_codigos_imss',

  USERS_LIST: 'usuarios_listado',
  USERS_REGISTER: 'usuarios_registro',
  USERS_DETAILS: 'usuarios_detalles',
  USERS_EDIT: 'usuarios_edicion',

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
      // clientes
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
        path: 'clientes/:clientId(\\d+)/accesos',
        name: ROUTER_NAMES.CLIENTS_CODES_DETAILS,
        component: () => import('pages/clients/ClientsDetailAccessPage.vue'),
      },
      {
        path: 'clientes/:clientId(\\d+)/accesos/editar-sat',
        name: ROUTER_NAMES.CLIENTS_CODES_EDIT_SAT,
        component: () => import('pages/clients/ClientsEditAccessPage.vue'),
      },
      {
        path: 'clientes/:clientId(\\d+)/accesos/editar-imss',
        name: ROUTER_NAMES.CLIENTS_CODES_EDIT_IMSS,
        component: () => import('pages/clients/ClientsEditAccessPage.vue'),
      },
      // usuarios
      {
        path: 'usuarios',
        name: ROUTER_NAMES.USERS_LIST,
        component: () => import('pages/users/UsersListPage.vue'),
      },
      {
        path: 'usuarios/registro',
        name: ROUTER_NAMES.USERS_REGISTER,
        component: () => import('pages/users/UsersCreatePage.vue'),
      },
      {
        path: 'usuarios/:userId(\\d+)',
        name: ROUTER_NAMES.USERS_DETAILS,
        component: () => import('pages/users/UsersDetailsPage.vue'),
      },
      {
        path: 'usuarios/:userId(\\d+)/edicion',
        name: ROUTER_NAMES.USERS_EDIT,
        component: () => import('pages/users/UsersEditPage.vue'),
      },
      // TODO; crear mas rutas
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
      {
        path: 'configuraciones',
        name: ROUTER_NAMES.SETTINGS,
        component: () => import('pages/ConfigPage.vue'),
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
