<template>
  <q-layout view="lHh Lpr lFf">
    <q-header>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title> S&amp;B </q-toolbar-title>

        <div>{{ authStore?.user?.name }}</div>
        <q-btn
          icon="logout"
          size="sm"
          flat
          rounded
          class="q-ml-xs"
          @click="logout"
        ></q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above :width="260">
      <div class="row justify-center items-center q-py-md divider q-mb-sm">
        <div class="col-auto q-mr-lg">
          <img
            src="~assets/sb-logo.jpg"
            style="width: 50px; border-radius: 8px"
          />
        </div>
        <div class="col-auto" style="font-size: 30px">S&amp;B</div>
      </div>
      <q-scroll-area style="height: calc(100% - 100px)">
        <q-list>
          <q-item
            clickable
            v-ripple
            v-for="item in mainLinks"
            :key="item.title"
            :to="item.to"
            active-class="active-page"
            exact
          >
            <q-item-section avatar>
              <q-icon :name="item.icon" />
            </q-item-section>

            <q-item-section> {{ item.title }} </q-item-section>
          </q-item>

          <q-separator spaced />
          <q-item-label header>Sistema</q-item-label>

          <q-item
            clickable
            v-ripple
            v-for="item in sistemLinks"
            :key="item.title"
          >
            <q-item-section avatar>
              <q-icon :name="item.icon" />
            </q-item-section>

            <q-item-section> {{ item.title }} </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar'
import { ROUTER_NAMES } from 'src/router'
import { useAuthStore } from 'src/stores/auth-store'
import { ref } from 'vue'
import { RouteLocationRaw, useRouter } from 'vue-router'

const authStore = useAuthStore()
const $q = useQuasar()
const router = useRouter()

const logout = () => {
  $q.localStorage.clear()
  router.push({ name: ROUTER_NAMES.LOGIN })
}

const mainLinks = [
  {
    title: 'Inicio',
    icon: 'home',
    to: { name: ROUTER_NAMES.HOME } as RouteLocationRaw,
  },
  {
    title: 'Clientes',
    icon: 'business',
    to: { name: ROUTER_NAMES.CLIENTS_LIST } as RouteLocationRaw,
  },
  {
    title: 'Tiempos',
    icon: 'schedule',
    to: { name: ROUTER_NAMES.TIMES } as RouteLocationRaw,
  },
  {
    title: 'Honorarios',
    icon: 'monetization_on',
    to: { name: ROUTER_NAMES.PAYMENT_OF_FEES } as RouteLocationRaw,
  },
  {
    title: 'Contraseñas',
    icon: 'lock',
    to: { name: ROUTER_NAMES.PASSWORDS } as RouteLocationRaw,
  },
]

const sistemLinks = [
  {
    title: 'Usuarios',
    icon: 'people',
    to: { name: ROUTER_NAMES.HOME } as RouteLocationRaw,
  },
  {
    title: 'Configuraciones',
    icon: 'settings',
    to: { name: ROUTER_NAMES.HOME } as RouteLocationRaw,
  },
]

const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>

<style lang="sass" scoped>
.divider
  position: relative
  &::before
    content: ''
    position: absolute
    border-bottom: solid 1px white
    bottom: 0
    left: 10px
    right: 10px
    height: 1px
    background: #000
.active-page
  background: white
  color: #000
</style>
