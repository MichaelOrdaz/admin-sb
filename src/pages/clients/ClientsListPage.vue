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
                <q-table row-key="name" :rows="clients" :columns="columns">
                  <template v-slot:body-cell-actions="props">
                    <q-td :props="props">
                      <q-btn flat round icon="zoom_in" />
                      <q-btn flat round icon="edit" />
                      <q-btn flat round icon="delete" />
                    </q-td>
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
import { useAuthStore } from 'src/stores/auth-store'
import { ref } from 'vue'

const authStore = useAuthStore()
useMeta({
  title: 'Clientes::S&B',
})

const clients = ref<Client[]>([])

const getClients = async () => {
  const response = await new ClientesApi().clientsControllerFindClients({
    headers: {
      Authorization: `Bearer ${authStore.token}`,
    },
  })
  clients.value = response.data.data?.clients as Client[]
}

getClients()

const columns: QTableProps['columns'] = [
  {
    name: 'name',
    label: 'Nombre o Razón social',
    field: (row: Client) =>
      `${row.name} ${row.paternalSurname} ${row.maternalSurname}`,
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
    name: 'tipoPpersona',
    label: 'Tipo de persona',
    field: 'name',
    align: 'left',
  },
  {
    name: 'regimen',
    label: 'Regimen',
    field: (row: Client) => row.regimes[0].name,
    align: 'left',
  },
  { name: 'email', label: 'email', field: 'email', align: 'left' },
  { name: 'actions', label: 'acciones', field: 'acciones' },
]
</script>
