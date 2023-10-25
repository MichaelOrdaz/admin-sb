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
            query: { active: $route.query.active },
          }"
        />
        <q-route-tab
          v-if="$route.query.active === '1'"
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
            <template v-if="$route.query.active === '1'">
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
                @click="showDialogActionInactive"
              />
            </template>
            <template v-else>
              <q-btn
                color="primary"
                icon="settings_backup_restore"
                label="reactivar"
                @click="showDialogActionRestore"
              />
              <q-btn
                color="negative"
                icon="delete"
                label="eliminar"
                @click="showDialogActionDelete"
              />
            </template>
          </q-card-actions>

          <q-card-section v-if="client">
            <template v-if="$route.query.active === '0'">
              <div
                class="text-weight-bold q-mb-md bg-yellow-6 q-pa-xs rounded-borders text-dark"
              >
                MOTIVO DE BAJA
              </div>
              <div
                class="row q-mt-sm q-mb-lg bg-yellow-5 rounded-borders q-pa-sm text-dark"
              >
                <div class="col-12">
                  Fecha de baja
                  {{ dayjs(client.deletedAt).format('LLLL') }}
                </div>
                <div class="col-12">
                  {{ client.reasonToInactive }}
                </div>
              </div>
            </template>

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
            <div
              class="text-weight-bold q-mb-md bg-blue-grey-6 q-pa-xs rounded-borders q-mt-lg"
            >
              Observaciones
            </div>
            <div class="row q-my-sm">
              <div class="col">{{ client.observations || '' }}</div>
            </div>
          </q-card-section>

          <q-inner-loading :showing="loading">
            <q-spinner-gears size="50px" color="primary" />
          </q-inner-loading>
        </q-card>
      </div>
    </div>

    <q-dialog v-model="confirm" persistent>
      <q-card>
        <q-card-section class="items-start" v-if="client">
          <q-avatar
            :icon="messageDialog.icon"
            :color="messageDialog.colorIcon"
            text-color="white"
          />
          <div class="q-ml-sm" v-if="client">
            {{ messageDialog.message }}

            <q-input
              v-show="messageDialog.action === 'inactive'"
              class="q-mt-md"
              v-model="messageDialog.inputExtra"
              filled
              type="textarea"
              label="Motivo por el cual se desactivar al cliente *"
              color="white"
              error-message="El motivo es requerido"
              :error="!isValidReason"
            />
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            :label="messageDialog.labelBtnConfirm"
            :color="messageDialog.colorIcon"
            v-close-popup
            :disable="
              messageDialog.action === 'inactive' &&
              messageDialog.inputExtra.length === 0
            "
            @click="
              () => {
                if (messageDialog.action === 'inactive') {
                  if (messageDialog.inputExtra === '') {
                    return
                  }
                  inactiveClient()
                } else if (messageDialog.action === 'restore') {
                  restoreClient()
                } else if (messageDialog.action === 'delete') {
                  deleteClient()
                }
              }
            "
          />
          <q-btn flat label="cancelar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { AxiosError } from 'axios'

import { useMeta, useQuasar } from 'quasar'
import { Client, ClientesApi, Configuration } from 'src/api-client'
import { ROUTER_NAMES } from 'src/router'
import { useAuthStore } from 'src/stores/auth-store'
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import 'dayjs/locale/es'
dayjs.locale('es')
dayjs.extend(localizedFormat)

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

const messageDialog = reactive({
  action: '',
  message: '',
  icon: '',
  colorIcon: '',
  labelBtnConfirm: '',
  inputExtra: '',
})

const isValidReason = computed(() => messageDialog.inputExtra.length > 0)

const getClient = async () => {
  loading.value = true
  try {
    const active = route.query?.active as string
    const response = await new ClientesApi(
      configToken
    ).clientsControllerFindOneClient(
      +route.params.clientId,
      +active === 0 ? 1 : (0 as 0 | 1)
    )
    client.value = response.data.data?.client as Client
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

const inactiveClient = async () => {
  if (client.value) {
    try {
      await new ClientesApi(configToken).clientsControllerSoftRemoveClient(
        client.value?.id as number,
        {
          reason: messageDialog.inputExtra,
        }
      )

      messageDialog.inputExtra = ''

      router.push({ name: ROUTER_NAMES.CLIENTS_LIST })

      $q.notify({
        color: 'primary',
        message: 'El cliente ha sido desactivado',
      })
    } catch (e) {
      if (e instanceof AxiosError) {
        $q.notify({
          color: 'negative',
          message: `Error. ${e.response?.data.message}`,
        })
      } else {
        $q.notify({
          color: 'negative',
          message: 'Error desconocido reintente',
        })
      }
    }
  }
}

const restoreClient = async () => {
  if (client.value) {
    try {
      await new ClientesApi(configToken).clientsControllerRestoreClient(
        client.value?.id as number
      )

      router.push({ name: ROUTER_NAMES.CLIENTS_LIST })

      $q.notify({
        color: 'positive',
        message: 'El cliente ha sido reactivado',
      })
    } catch (e) {
      if (e instanceof AxiosError) {
        $q.notify({
          color: 'negative',
          message: `Error. ${e.response?.data.message}`,
        })
      } else {
        $q.notify({
          color: 'negative',
          message: 'Error desconocido reintente',
        })
      }
    }
  }
}

const deleteClient = async () => {
  if (client.value) {
    try {
      await new ClientesApi(configToken).clientsControllerForceRemoveClient(
        client.value?.id as number
      )

      router.push({ name: ROUTER_NAMES.CLIENTS_LIST })

      $q.notify({
        color: 'primary',
        message: 'El cliente ha sido eliminado',
      })
    } catch (e) {
      if (e instanceof AxiosError) {
        $q.notify({
          color: 'negative',
          message: `Error. ${e.response?.data.message}`,
        })
      } else {
        $q.notify({
          color: 'negative',
          message: 'Error desconocido reintente',
        })
      }
    }
  }
}

const showDialogActionInactive = () => {
  if (!client.value) return
  confirm.value = true
  messageDialog.action = 'inactive'
  messageDialog.message = `¿Deseas desactivar al cliente ${client.value.name} ${client.value.paternalSurname} de la lista?`
  messageDialog.icon = 'remove_circle'
  messageDialog.colorIcon = 'warning'
  messageDialog.labelBtnConfirm = 'Desactivar'
}

const showDialogActionDelete = () => {
  if (!client.value) return
  confirm.value = true
  messageDialog.action = 'delete'
  messageDialog.message = `¿Deseas eliminar al cliente ${client.value.name} ${client.value.paternalSurname} del sistema? Esta acción es irreversible`
  messageDialog.icon = 'delete'
  messageDialog.colorIcon = 'negative'
  messageDialog.labelBtnConfirm = 'Eliminar'
}

const showDialogActionRestore = () => {
  if (!client.value) return
  confirm.value = true
  messageDialog.action = 'restore'
  messageDialog.message = `¿Deseas reactivar al cliente ${client.value.name} ${client.value.paternalSurname}?`
  messageDialog.icon = 'settings_backup_restore'
  messageDialog.colorIcon = 'positive'
  messageDialog.labelBtnConfirm = 'Restaurar'
}
</script>
