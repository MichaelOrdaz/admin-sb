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

        <div>v{{ $q.version }}</div>
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
import { ref } from 'vue'

const mainLinks = [
  {
    title: 'Inicio',
    icon: 'home',
    to: '',
  },
  {
    title: 'Clientes',
    icon: 'business',
    to: 'Honorarios',
  },
  {
    title: 'Tiempos',
    icon: 'schedule',
    to: 'Honorarios',
  },
  {
    title: 'Honorarios',
    icon: 'monetization_on',
    to: 'Honorarios',
  },
  {
    title: 'Contraseñas',
    icon: 'lock',
    to: 'Honorarios',
  },
]

const sistemLinks = [
  {
    title: 'Usuarios',
    icon: 'people',
    to: 'Honorarios',
  },
  {
    title: 'Configuraciones',
    icon: 'settings',
    to: 'Honorarios',
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
</style>
