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
                      />
                      <q-btn flat round icon="edit" />
                      <q-btn flat round icon="delete" />
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
  </q-page>
</template>

<script setup lang="ts">
import { QTableProps, useMeta } from 'quasar'
import { Client, ClientesApi } from 'src/api-client'
import { ROUTER_NAMES } from 'src/router'
import { ref } from 'vue'

useMeta({
  title: 'Clientes::S&B',
})

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
</script>
