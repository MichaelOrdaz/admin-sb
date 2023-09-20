<template>
  <q-page class="q-pa-md">
    <div class="row">
      <div class="col-sm-9">
        <q-card>
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
          <q-card-section>
            <h5 class="q-my-none">Información del cliente</h5>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn
              color="primary"
              icon="edit"
              label="editar"
              :to="{
                name: ROUTER_NAMES.CLIENTS_EDIT,
                params: { clientId: client?.id },
              }"
            />
            <q-btn
              color="yellow"
              text-color="black"
              icon="remove_circle"
              label="desactivar"
              @click="confirm = true"
            />
          </q-card-actions>

          <q-card-section v-if="client">
            <div
              class="text-weight-bold q-mb-md bg-blue-grey-6 q-pa-xs rounded-borders"
            >
              Datos Generales
            </div>
            <div class="row q-my-sm">
              <div class="col-2">Nombre completo:</div>
              <div class="col">
                {{ client.name }} {{ client.paternalSurname }}
                {{ client.maternalSurname || '' }}
              </div>
            </div>
            <div class="row q-my-sm">
              <div class="col-2">RFC:</div>
              <div class="col">{{ client.rfc }}</div>
              <div class="col-2">CURP:</div>
              <div class="col">{{ client.curp || '' }}</div>
            </div>
            <div
              class="text-weight-bold q-mb-md bg-blue-grey-6 q-pa-xs rounded-borders q-mt-lg"
            >
              Actividades Fiscales
            </div>

            <div
              class="row q-my-sm"
              v-for="activity in client.activities"
              :key="activity.id"
            >
              <div class="col-2">Actividad:</div>
              <div class="col">{{ activity.name }}</div>
              <div class="col-2">Porcentaje:</div>
              <div class="col-2">{{ activity.percentage }}</div>
            </div>
            <div
              class="text-weight-bold q-mb-md bg-blue-grey-6 q-pa-xs rounded-borders q-mt-lg"
            >
              Regimen Fiscal
            </div>
            <div
              class="row q-my-sm"
              v-for="regimen in client.regimes"
              :key="regimen.id"
            >
              <div class="col-2">Regimen:</div>
              <div class="col">{{ regimen.name }}</div>
            </div>
            <div
              class="text-weight-bold q-mb-md bg-blue-grey-6 q-pa-xs rounded-borders q-mt-lg"
            >
              Dirección
            </div>
            <div class="row q-my-sm">
              <div class="col-2">Calle:</div>
              <div class="col">{{ client.street }}</div>
            </div>
            <div class="row q-my-sm">
              <div class="col-2">Num. ext.:</div>
              <div class="col">{{ client.outdoorNumber || '' }}</div>
              <div class="col-2">Num. int.:</div>
              <div class="col">{{ client.interiorNumber || '' }}</div>
            </div>
            <div class="row q-my-sm">
              <div class="col-2">Colonia:</div>
              <div class="col">{{ client.cologne || '' }}</div>
              <div class="col-2">Código Postal:</div>
              <div class="col">{{ client.postalCode || '' }}</div>
            </div>
            <div class="row q-my-sm">
              <div class="col-2">Ciudad/Municipio:</div>
              <div class="col">{{ client.province || '' }}</div>
              <div class="col-2">Estado:</div>
              <div class="col">{{ client.state || '' }}</div>
            </div>
            <div
              class="text-weight-bold q-mb-md bg-blue-grey-6 q-pa-xs rounded-borders q-mt-lg"
            >
              Contacto
            </div>
            <div class="row q-my-sm">
              <div class="col-2">Email:</div>
              <div class="col">{{ client.email || '' }}</div>
              <div class="col-2">Teléfono:</div>
              <div class="col">{{ client.phone || '' }}</div>
            </div>
            <div class="row q-my-sm">
              <div class="col-2">Teléfono alternativo:</div>
              <div class="col">{{ client.phone2 || '' }}</div>
            </div>
            <div
              class="text-weight-bold q-mb-md bg-blue-grey-6 q-pa-xs rounded-borders q-mt-lg"
            >
              Datos representante legal
            </div>
            <div class="row q-my-sm">
              <div class="col-2">Nombre representante legal:</div>
              <div class="col">
                {{ client.legalRepresentativeFullname || '' }}
              </div>
              <div class="col-2">RFC representante legal:</div>
              <div class="col">{{ client.legalRepresentativeRFC || '' }}</div>
            </div>
            <div class="row q-my-sm">
              <div class="col-2">CURP representante legal:</div>
              <div class="col">{{ client.legalRepresentativeCURP || '' }}</div>
            </div>
          </q-card-section>

          <q-inner-loading :showing="loading">
            <q-spinner-gears size="50px" color="primary" />
          </q-inner-loading>
        </q-card>
      </div>
      <div class="col-sm-3 q-px-lg">
        <q-card>
          <q-list bordered separator>
            <q-item clickable v-ripple>
              <q-item-section avatar>
                <q-icon name="architecture" />
              </q-item-section>
              <q-item-section>Procesos</q-item-section>
            </q-item>
            <q-item clickable v-ripple>
              <q-item-section avatar>
                <q-icon name="key" />
              </q-item-section>
              <q-item-section>Contraseñas</q-item-section>
            </q-item>
            <q-item clickable v-ripple>
              <q-item-section avatar>
                <q-icon name="paid" />
              </q-item-section>
              <q-item-section>Honorarios</q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>
    </div>

    <q-dialog v-model="confirm" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="remove_circle" color="negative" text-color="white" />
          <span class="q-ml-sm" v-if="client"
            >Deseas desactivar al cliente {{ client.name }}
            {{ client?.paternalSurname }}.</span
          >
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            label="Desactivar"
            color="negative"
            v-close-popup
            @click="deleteClient"
          />
          <q-btn flat label="cancelar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { useMeta, useQuasar } from 'quasar'
import { Client, ClientesApi, Configuration } from 'src/api-client'
import { ROUTER_NAMES } from 'src/router'
import { useAuthStore } from 'src/stores/auth-store'
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()

useMeta({
  title: 'Clientes::S&B',
})

const authStore = useAuthStore()
const configToken = new Configuration({ accessToken: authStore.token })

const confirm = ref(false)

const loading = ref(false)
const client = ref<Client | null>(null)

const getClient = async () => {
  loading.value = true
  const response = await new ClientesApi(
    configToken
  ).clientsControllerFindOneClient(+route.params.clientId)
  client.value = response.data.data?.client as Client
  loading.value = false
}

getClient()

watch(
  () => route.params,
  (to) => {
    if (to?.clientId) getClient()
  }
)

const deleteClient = async () => {
  if (client.value) {
    try {
      const response = await new ClientesApi(
        configToken
      ).clientsControllerSoftRemoveClient(client.value?.id as number)

      router.push({ name: ROUTER_NAMES.CLIENTS_LIST })

      $q.notify({
        color: 'primary',
        message: 'El cliente fue desactivado',
      })
    } catch (e) {
      $q.notify({
        color: 'warning',
        message: 'Ocurrio un error, reintente',
      })
    }
  }
}
</script>
