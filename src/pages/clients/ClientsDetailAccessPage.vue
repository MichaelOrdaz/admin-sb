<template>
  <q-page class="q-pa-md">
    <q-card class="q-mb-md" flat>
      <q-tabs no-caps align="left" inline-label>
        <q-route-tab
          label="Detalle"
          icon="business"
          :to="{
            name: ROUTER_NAMES.CLIENTS_DETAILS,
            params: { clientId: $route.params.clientId },
            query: { active: 1 },
          }"
        />
        <q-route-tab
          label="Claves de acceso"
          icon="key"
          :to="{
            name: ROUTER_NAMES.CLIENTS_CODES_DETAILS,
            params: { clientId: $route.params.clientId },
          }"
        />
      </q-tabs>
    </q-card>

    <div class="row q-col-gutter-x-sm">
      <div class="col">
        <q-card flat>
          <q-card-actions>
            <q-btn
              @click="$router.back()"
              color="white"
              icon="arrow_back"
              flat
              rounded
            >
            </q-btn>
          </q-card-actions>
          <q-card-section class="q-pt-none">
            <h5 class="q-my-none">Claves de acceso</h5>
            <template v-if="client">
              <span>
                Cliente: {{ client.name }} {{ client.paternalSurname }}
                {{ client.maternalSurname }}
                <br />
                RFC: {{ client.rfc }}
              </span>
            </template>
          </q-card-section>

          <q-inner-loading :showing="loading">
            <q-spinner-gears size="50px" color="primary" />
          </q-inner-loading>
        </q-card>
      </div>
    </div>

    <div class="row q-my-lg">
      <div class="col">
        <AccessCodeDetailsSat v-if="client" :client="client" />
      </div>
    </div>

    <div class="row q-my-lg">
      <div class="col">
        <AccessCodeDetailsImss v-if="client" :client="client" />
      </div>
    </div>

    <div class="row q-my-lg">
      <div class="col">
        <AccessCodeDetailsOthers v-if="client" :client="client" />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { AxiosError } from 'axios'

import { useMeta, useQuasar } from 'quasar'
import { Client, ClientesApi, Configuration } from 'src/api-client'
import { ROUTER_NAMES } from 'src/router'
import { useAuthStore } from 'src/stores/auth-store'
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import 'dayjs/locale/es'
dayjs.locale('es')
dayjs.extend(localizedFormat)

import AccessCodeDetailsSat from './clientsCodesSubViews/AccessCodeDetailsSat.vue'
import AccessCodeDetailsImss from './clientsCodesSubViews/AccessCodeDetailsImss.vue'
import AccessCodeDetailsOthers from './clientsCodesSubViews/AccessCodeDetailsOthers.vue'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()

useMeta({
  title: 'Clientes::S&B',
})

const authStore = useAuthStore()
const configToken = new Configuration({ accessToken: authStore.token })

const loading = ref(false)
const client = ref<Client | null>(null)

const getClient = async () => {
  loading.value = true
  try {
    const responseClient = await new ClientesApi(
      configToken
    ).clientsControllerFindOneClient(+route.params.clientId, 0)
    client.value = responseClient.data.data?.client as Client

    loading.value = false
  } catch (e) {
    if (e instanceof AxiosError) {
      loading.value = false
      router.back()
      $q.notify({
        color: 'negative',
        message: e.response?.data.message,
      })
    }
  }
}

getClient()

watch(
  () => route.params,
  (to) => {
    if (to?.clientId) getClient()
  }
)
</script>
