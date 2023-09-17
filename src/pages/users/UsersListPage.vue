<template>
  <q-page class="q-pa-md">
    <div class="row">
      <div class="col-xs-12">
        <q-card>
          <q-card-section class="text-right">
            <q-btn color="primary" :to="{ name: ROUTER_NAMES.USERS_REGISTER }">
              Agregar usuario
            </q-btn>
          </q-card-section>
          <q-card-section>
            Lista de usuarios con acceso al sistema
          </q-card-section>

          <q-card-section>
            <div class="row">
              <div class="col">
                <q-table
                  row-key="name"
                  :rows="users"
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
                          name: ROUTER_NAMES.USERS_DETAILS,
                          params: { userId: props.row.id },
                        }"
                        title="detalles de usuario"
                      />
                      <q-btn
                        flat
                        round
                        icon="edit"
                        :to="{
                          name: ROUTER_NAMES.USERS_EDIT,
                          params: { userId: props.row.id },
                        }"
                        title="editar usuario"
                      />
                      <q-btn
                        flat
                        round
                        icon="remove_circle"
                        @click=";(confirm = true), (selected = props.row)"
                        title="Desactivar usuario"
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
import { ROUTER_NAMES } from 'src/router'
import { User, UsersApi } from 'src/api-client'
import { ref } from 'vue'

const $q = useQuasar()

useMeta({
  title: 'Usuarios::S&B',
})

const confirm = ref(false)
const selected = ref<User | null>(null)

const loading = ref(false)
const filter = ref('')
const users = ref<User[]>([])

const getUsers = async () => {
  loading.value = true
  const response = await new UsersApi().usersControllerFindAll()
  users.value = response.data.data?.users as User[]
  loading.value = false
}

getUsers()

const columns: QTableProps['columns'] = [
  {
    name: 'name',
    label: 'Nombre completo',
    field: (row: User) =>
      `${row.name} ${row.paternalSurname || ''} ${row.maternalSurname || ''}`,
    align: 'left',
    required: true,
    sortable: true,
  },
  {
    name: 'email',
    align: 'left',
    label: 'email',
    field: 'email',
    sortable: true,
  },
  {
    name: 'phone',
    label: 'Teléfono',
    field: 'phone',
    align: 'left',
  },
  {
    name: 'role',
    label: 'Rol',
    field: (row: User) =>
      row.role === 'admin' ? 'ADMINISTRADOR' : 'OPERATIVO',
    align: 'left',
  },
  { name: 'actions', label: 'acciones', field: 'acciones' },
]

const deleteClient = async () => {
  if (selected.value) {
    try {
      const response = await new UsersApi().usersControllerSoftRemoveUser(
        selected.value?.id as number
      )

      getUsers()

      $q.notify({
        color: 'primary',
        message: 'El usuario fue desactivado',
      })
    } catch (e) {
      $q.notify({
        color: 'negative',
        message:
          'Upps, hubo un problema al realizar la acción, por favor reintenta',
      })
    }
  }
}
</script>
