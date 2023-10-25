<template>
  <q-page class="q-pa-md">
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
            <h5 class="q-my-none">
              Editar claves de acceso
              <span v-if="$route.name === ROUTER_NAMES.CLIENTS_CODES_EDIT_SAT">
                SAT
              </span>
              <span
                v-else-if="$route.name === ROUTER_NAMES.CLIENTS_CODES_EDIT_IMSS"
                >IMSS
              </span>
              <span
                v-else-if="
                  $route.name === ROUTER_NAMES.CLIENTS_CODES_EDIT_OTHERS
                "
                >Infonavit, ISN y otras
              </span>
            </h5>
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
        <AccessCodeFormSat
          v-if="client && $route.name === ROUTER_NAMES.CLIENTS_CODES_EDIT_SAT"
          :client="client"
        />
        <AccessCodeFormImss
          v-else-if="
            client && $route.name === ROUTER_NAMES.CLIENTS_CODES_EDIT_IMSS
          "
          :client="client"
        />
        <AccessCodeFormOthers
          v-else-if="
            client && $route.name === ROUTER_NAMES.CLIENTS_CODES_EDIT_OTHERS
          "
          :client="client"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { AxiosError } from 'axios'

import { useMeta, useQuasar } from 'quasar'
import { Client, ClientesApi, Configuration } from 'src/api-client'
import { useAuthStore } from 'src/stores/auth-store'
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ROUTER_NAMES } from 'src/router'

import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import 'dayjs/locale/es'
dayjs.locale('es')
dayjs.extend(localizedFormat)

import AccessCodeFormSat from './clientsCodesSubViews/AccessCodeFormSat.vue'
import AccessCodeFormImss from './clientsCodesSubViews/AccessCodeFormImss.vue'
import AccessCodeFormOthers from './clientsCodesSubViews/AccessCodeFormOthers.vue'

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
