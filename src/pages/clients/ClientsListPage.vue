<template>
  <q-page class="q-pa-md">
    <div class="row">
      <div class="col-xs-12">
        <q-card>
          <q-card-section class="text-right">
            <q-btn color="primary" :to="{ name: ROUTER_NAMES.CLIENTS_NEW }">
              Agregar cliente
            </q-btn>
          </q-card-section>
          <q-card-section>Lista de clientes</q-card-section>

          <q-tabs v-model="tab" no-caps align="left" inline-label>
            <q-tab name="active" label="Activos" icon="people" />
            <q-tab name="inactive" label="Inactivos" icon="group_remove" />
          </q-tabs>

          <q-table
            row-key="name"
            :rows="clients"
            :columns="columns"
            :loading="loading"
            :filter="filter"
            :pagination="{
              rowsPerPage: 10,
            }"
          >
            <template v-slot:body-cell-actions="props">
              <q-td :props="props">
                <q-btn
                  flat
                  round
                  icon="zoom_in"
                  :to="{
                    name: ROUTER_NAMES.CLIENTS_DETAILS,
                    params: { clientId: props.row.id },
                  }"
                  title="detalles de cliente"
                />
                <template v-if="tab === 'active'">
                  <q-btn
                    flat
                    round
                    icon="edit"
                    :to="{
                      name: ROUTER_NAMES.CLIENTS_EDIT,
                      params: { clientId: props.row.id },
                    }"
                    title="editar cliente"
                  />
                  <q-btn
                    flat
                    round
                    icon="remove_circle"
                    @click="showDialogActionInactive(props.row)"
                    title="Desactivar cliente"
                  />
                </template>
                <template v-else>
                  <q-btn
                    flat
                    round
                    icon="settings_backup_restore"
                    @click="showDialogActionRestore(props.row)"
                    title="Reactivar"
                  />
                  <q-btn
                    flat
                    round
                    icon="delete"
                    @click="showDialogActionDelete(props.row)"
                    title="Eliminar"
                  />
                </template>
              </q-td>
            </template>
            <template v-slot:loading>
              <q-inner-loading showing color="primary" />
            </template>
            <template v-slot:top>
              <q-space />
              <q-input
                filled
                debounce="300"
                color="primary"
                label="buscar"
                v-model="filter"
              >
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </template>
          </q-table>
        </q-card>
      </div>
    </div>

    <q-dialog v-model="confirm" persistent>
      <q-card>
        <q-card-section class="items-start" v-if="selected">
          <q-avatar
            :icon="messageDialog.icon"
            :color="messageDialog.colorIcon"
            text-color="white"
          />
          <div class="q-ml-sm" v-if="selected">
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
import { QTableProps, useMeta, useQuasar } from 'quasar'
import { Client, ClientesApi, Configuration } from 'src/api-client'
import { ROUTER_NAMES } from 'src/router'
import { useAuthStore } from 'src/stores/auth-store'
import { computed, reactive, ref, watch } from 'vue'

const $q = useQuasar()
const authStore = useAuthStore()
const configToken = new Configuration({ accessToken: authStore.token })

useMeta({
  title: 'Clientes::S&B',
})

const confirm = ref(false)
const selected = ref<Client | null>(null)
const messageDialog = reactive({
  action: '',
  message: '',
  icon: '',
  colorIcon: '',
  labelBtnConfirm: '',
  inputExtra: '',
})

const isValidReason = computed(() => messageDialog.inputExtra.length > 0)

const loading = ref(false)
const filter = ref('')
const clients = ref<Client[]>([])

const tab = ref('active')

const getClients = async () => {
  loading.value = true
  const response = await new ClientesApi(
    configToken
  ).clientsControllerFindClients(tab.value === 'active' ? 0 : 1)
  clients.value = response.data.data?.clients as Client[]
  loading.value = false
}

watch(
  tab,
  () => {
    getClients()
  },
  { immediate: true }
)

const columns: QTableProps['columns'] = [
  {
    name: 'name',
    label: 'Nombre o Razón social',
    field: (row: Client) =>
      `${row.name} ${row.paternalSurname || ''} ${row.maternalSurname || ''}`,
    align: 'left',
    required: true,
    sortable: true,
  },
  {
    name: 'rfc',
    align: 'left',
    label: 'RFC',
    field: 'rfc',
    sortable: true,
  },
  {
    name: 'tipoPersona',
    label: 'Tipo de persona',
    field: (row: Client) => (row.rfc.length === 12 ? 'MORAL' : 'FÍSICA'),
    align: 'left',
  },
  {
    name: 'regimen',
    label: 'Regimen',
    field: (row: Client) => {
      if (row.regimes?.[0].name) {
        return (
          row.regimes?.[0].name.substring(0, 24) +
          (row.regimes?.[0].name.length > 24 ? '...' : '')
        )
      }
      return ''
    },
    align: 'left',
  },
  { name: 'email', label: 'email', field: 'email', align: 'left' },
  { name: 'actions', label: 'acciones', field: 'acciones' },
]

const inactiveClient = async () => {
  if (selected.value) {
    await new ClientesApi(configToken).clientsControllerSoftRemoveClient(
      selected.value?.id as number,
      {
        reason: messageDialog.inputExtra,
      }
    )

    messageDialog.inputExtra = ''

    getClients()

    $q.notify({
      color: 'primary',
      message: 'El cliente ha sido desactivado',
    })
  }
}

const restoreClient = async () => {
  if (selected.value) {
    await new ClientesApi(configToken).clientsControllerRestoreClient(
      selected.value?.id as number
    )

    getClients()

    $q.notify({
      color: 'positive',
      message: 'El cliente ha sido reactivado',
    })
  }
}

const deleteClient = async () => {
  if (selected.value) {
    await new ClientesApi(configToken).clientsControllerForceRemoveClient(
      selected.value?.id as number
    )

    getClients()

    $q.notify({
      color: 'primary',
      message: 'El cliente ha sido eliminado',
    })
  }
}

const showDialogActionInactive = (row: Client) => {
  confirm.value = true
  selected.value = row
  messageDialog.action = 'inactive'
  messageDialog.message = `¿Deseas desactivar al cliente ${row.name} ${row.paternalSurname} de la lista?`
  messageDialog.icon = 'remove_circle'
  messageDialog.colorIcon = 'warning'
  messageDialog.labelBtnConfirm = 'Desactivar'
}

const showDialogActionDelete = (row: Client) => {
  confirm.value = true
  selected.value = row
  messageDialog.action = 'delete'
  messageDialog.message = `¿Deseas eliminar al cliente ${row.name} ${row.paternalSurname} del sistema? Esta acción es irreversible`
  messageDialog.icon = 'delete'
  messageDialog.colorIcon = 'negative'
  messageDialog.labelBtnConfirm = 'Eliminar'
}

const showDialogActionRestore = (row: Client) => {
  confirm.value = true
  selected.value = row
  messageDialog.action = 'restore'
  messageDialog.message = `¿Deseas reactivar al cliente ${row.name} ${row.paternalSurname}?`
  messageDialog.icon = 'settings_backup_restore'
  messageDialog.colorIcon = 'positive'
  messageDialog.labelBtnConfirm = 'Restaurar'
}
</script>
