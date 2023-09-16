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
          <q-card-section> Lista de clientes </q-card-section>

          <q-card-section>
            <div class="row">
              <div class="col">
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
                        @click=";(confirm = true), (selected = props.row)"
                        title="Desactivar cliente"
                      />
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
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-dialog v-model="confirm" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="remove_circle" color="negative" text-color="white" />
          <span class="q-ml-sm" v-if="selected"
            >Deseas desactivar al cliente {{ selected.name }}
            {{ selected?.paternalSurname }} de la lista.</span
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
import { QTableProps, useMeta, useQuasar } from 'quasar'
import { Client, ClientesApi } from 'src/api-client'
import { ROUTER_NAMES } from 'src/router'
import { ref } from 'vue'

const $q = useQuasar()

useMeta({
  title: 'Clientes::S&B',
})

const confirm = ref(false)
const selected = ref<Client | null>(null)

const loading = ref(false)
const filter = ref('')
const clients = ref<Client[]>([])

const getClients = async () => {
  loading.value = true
  const response = await new ClientesApi().clientsControllerFindClients()
  clients.value = response.data.data?.clients as Client[]
  loading.value = false
}

getClients()

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

const deleteClient = async () => {
  if (selected.value) {
    const response = await new ClientesApi().clientsControllerSoftRemoveClient(
      selected.value?.id as number
    )

    getClients()

    $q.notify({
      color: 'primary',
      message: 'El cliente fue desactivado',
    })
  }
}
</script>
