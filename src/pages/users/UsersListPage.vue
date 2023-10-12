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

          <q-tabs v-model="tab" no-caps align="left" inline-label>
            <q-tab name="active" label="Activos" icon="people" />
            <q-tab name="inactive" label="Inactivos" icon="group_remove" />
          </q-tabs>

          <q-table
            row-key="id"
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
                    query: { active: tab === 'active' ? 1 : 0 },
                  }"
                  title="detalles de usuario"
                />
                <template v-if="tab === 'active'">
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
                    @click="showDialogActionInactive(props.row)"
                    title="Desactivar usuario"
                    :disable="authStore.user?.id === props.row.id"
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
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            :label="messageDialog.labelBtnConfirm"
            :color="messageDialog.colorIcon"
            v-close-popup
            @click="
              () => {
                if (messageDialog.action === 'inactive') {
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
import { ROUTER_NAMES } from 'src/router'
import { Configuration, User, UsersApi } from 'src/api-client'
import { reactive, ref, watch } from 'vue'
import { useAuthStore } from 'src/stores/auth-store'
import { AxiosError } from 'axios'

const $q = useQuasar()
const authStore = useAuthStore()
const configToken = new Configuration({ accessToken: authStore.token })

useMeta({
  title: 'Usuarios::S&B',
})

const tab = ref<'active' | 'inactive'>('active')

const confirm = ref(false)
const selected = ref<User | null>(null)
const messageDialog = reactive({
  action: '',
  message: '',
  icon: '',
  colorIcon: '',
  labelBtnConfirm: '',
})

const loading = ref(false)
const filter = ref('')
const users = ref<User[]>([])

const getUsers = async () => {
  loading.value = true
  try {
    const response = await new UsersApi(configToken).usersControllerFindAll(
      tab.value === 'active' ? 0 : 1
    )
    users.value = response.data.data?.users as User[]
    loading.value = false
  } catch (e) {
    loading.value = false
    $q.notify({
      color: 'negative',
      message:
        'Upps, hubo un problema al realizar la acción, por favor reintenta',
    })
  }
}

watch(
  tab,
  () => {
    getUsers()
  },
  { immediate: true }
)

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

const inactiveClient = async () => {
  if (selected.value) {
    try {
      await new UsersApi(configToken).usersControllerSoftRemoveUser(
        selected.value?.id as number
      )

      getUsers()

      $q.notify({
        color: 'primary',
        message: 'El usuario ha sido desactivado',
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
  if (selected.value) {
    try {
      await new UsersApi(configToken).usersControllerRestoreUser(
        selected.value?.id as number
      )

      getUsers()

      $q.notify({
        color: 'positive',
        message: 'El usuario ha sido reactivado',
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
  if (selected.value) {
    try {
      await new UsersApi(configToken).usersControllerForceRemoveUser(
        selected.value?.id as number
      )

      getUsers()

      $q.notify({
        color: 'primary',
        message: 'El cliente ha sido eliminado del sistema',
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

const showDialogActionInactive = (row: User) => {
  confirm.value = true
  selected.value = row
  messageDialog.action = 'inactive'
  messageDialog.message = `¿Deseas desactivar al usuario ${row.name} ${row.paternalSurname} de la lista? El usuario ya no podra acceder al sistema`
  messageDialog.icon = 'remove_circle'
  messageDialog.colorIcon = 'warning'
  messageDialog.labelBtnConfirm = 'Desactivar'
}

const showDialogActionDelete = (row: User) => {
  confirm.value = true
  selected.value = row
  messageDialog.action = 'delete'
  messageDialog.message = `¿Deseas eliminar al usuario ${row.name} ${row.paternalSurname} del sistema? Esta acción es irreversible`
  messageDialog.icon = 'delete'
  messageDialog.colorIcon = 'negative'
  messageDialog.labelBtnConfirm = 'Eliminar'
}

const showDialogActionRestore = (row: User) => {
  confirm.value = true
  selected.value = row
  messageDialog.action = 'restore'
  messageDialog.message = `¿Deseas reactivar al usuario ${row.name} ${row.paternalSurname}?`
  messageDialog.icon = 'settings_backup_restore'
  messageDialog.colorIcon = 'positive'
  messageDialog.labelBtnConfirm = 'Restaurar'
}
</script>
