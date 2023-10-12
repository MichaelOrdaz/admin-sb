<template>
  <q-page class="q-pa-md">
    <div class="row">
      <div class="col-sm-9" v-if="user">
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
            <h5 class="q-my-none">Información del usuario</h5>
          </q-card-section>
          <q-card-actions align="right">
            <template v-if="$route.query.active === '1'">
              <q-btn
                color="primary"
                icon="edit"
                label="editar"
                :to="{
                  name: ROUTER_NAMES.USERS_EDIT,
                  params: { userId: user?.id },
                }"
              />
              <q-btn
                color="primary"
                icon="key"
                label="Renovar contraseña"
                @click="confirmRenewPassword = true"
              />
              <q-btn
                color="yellow"
                text-color="black"
                icon="remove_circle"
                label="desactivar"
                @click="showDialogActionInactive"
                :disable="authStore.user?.id === user?.id"
                :title="
                  authStore.user?.id === user?.id
                    ? 'No puedes desactivar a tu mismo usuario'
                    : ''
                "
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

          <q-card-section v-if="user">
            <div
              class="text-weight-bold q-mb-md bg-blue-grey-6 q-pa-xs rounded-borders"
            >
              Datos Generales
            </div>
            <div class="row q-my-sm q-col-gutter-y-md">
              <div class="col-2">Nombre(s):</div>
              <div class="col-10">{{ user.name }}</div>
              <div class="col-2">Apellido paterno:</div>
              <div class="col-10">{{ user.paternalSurname }}</div>
              <div class="col-2">Apellido materno:</div>
              <div class="col-10">{{ user.maternalSurname }}</div>
              <div class="col-2">Email:</div>
              <div class="col-10">{{ user.email }}</div>
              <div class="col-2">Teléfono:</div>
              <div class="col-10">{{ user.phone }}</div>
              <div class="col-2">Rol:</div>
              <div class="col-10">
                {{ user.role === 'admin' ? 'ADMINISTRADOR' : 'OPERATIVO' }}
              </div>
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
        <q-card-section class="items-start" v-if="user">
          <q-avatar
            :icon="messageDialog.icon"
            :color="messageDialog.colorIcon"
            text-color="white"
          />
          <div class="q-ml-sm" v-if="user">
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

    <q-dialog v-model="confirmRenewPassword" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="warning" />
          <span class="q-ml-sm" v-if="user"
            >¿Deseas renovar la contraseña del usuario {{ user.name }}
            {{ user?.paternalSurname }}
            {{ user?.maternalSurname || '' }}.?</span
          >
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            label="Renovar contraseña"
            color="warning"
            v-close-popup
            @click="refreshPassword"
          />
          <q-btn flat label="cancelar" color="white" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="successPassword" @hide="() => (recoverPass = null)">
      <q-card class="bg-primary">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Contraseña reestablecida</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section v-if="user">
          La contraseña del usuario {{ user?.name }}
          {{ user?.paternalSurname }} fue reestablecida. <br />
          La nueva contraseña es la siguiente, recuerdala:
          <h4 class="text-center">{{ recoverPass || '' }}</h4>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { AxiosError } from 'axios'
import { useMeta, useQuasar } from 'quasar'
import { Configuration, User, UsersApi } from 'src/api-client'
import { ROUTER_NAMES } from 'src/router'
import { useAuthStore } from 'src/stores/auth-store'
import { reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()

const configToken = new Configuration({ accessToken: authStore.token })

useMeta({
  title: 'Usuarios::S&B',
})

const confirm = ref(false)
const confirmRenewPassword = ref(false)
const successPassword = ref(false)
const recoverPass = ref<string | null>(null)

const loading = ref(false)
const user = ref<User | null>(null)

const messageDialog = reactive({
  action: '',
  message: '',
  icon: '',
  colorIcon: '',
  labelBtnConfirm: '',
})

const getUser = async () => {
  loading.value = true
  try {
    const active = route.query?.active as string
    const response = await new UsersApi(configToken).usersControllerFindOne(
      +route.params.userId,
      +active === 0 ? 1 : (0 as 0 | 1)
    )
    user.value = response.data.data?.user as User
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

getUser()

watch(
  () => route.params,
  (to) => {
    if (to?.userId) getUser()
  }
)

const inactiveClient = async () => {
  if (user.value) {
    try {
      await new UsersApi(configToken).usersControllerSoftRemoveUser(
        user.value?.id as number
      )

      router.push({ name: ROUTER_NAMES.USERS_LIST })

      $q.notify({
        color: 'primary',
        message: 'El usuario ha sido desactivado y no podra acceder al sistema',
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
  if (user.value) {
    try {
      await new UsersApi(configToken).usersControllerRestoreUser(
        user.value?.id as number
      )

      router.push({ name: ROUTER_NAMES.USERS_LIST })

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
  if (user.value) {
    try {
      await new UsersApi(configToken).usersControllerForceRemoveUser(
        user.value?.id as number
      )

      router.push({ name: ROUTER_NAMES.USERS_LIST })

      $q.notify({
        color: 'primary',
        message: 'El usuario ha sido eliminado',
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

const refreshPassword = async () => {
  if (user.value) {
    try {
      const response = await new UsersApi(
        configToken
      ).usersControllerRegeneratePasswordUser(user.value?.id as number)
      recoverPass.value = response.data.data?.password as string
      successPassword.value = true
    } catch (e) {
      $q.notify({
        color: 'warning',
        message: 'Ocurrio un error, reintente',
      })
    }
  }
}

const showDialogActionInactive = () => {
  if (!user.value) return
  confirm.value = true
  messageDialog.action = 'inactive'
  messageDialog.message = `¿Deseas desactivar al usuario ${user.value.name} ${user.value.paternalSurname} de la lista?`
  messageDialog.icon = 'remove_circle'
  messageDialog.colorIcon = 'warning'
  messageDialog.labelBtnConfirm = 'Desactivar'
}

const showDialogActionDelete = () => {
  if (!user.value) return
  confirm.value = true
  messageDialog.action = 'delete'
  messageDialog.message = `¿Deseas eliminar al usuario ${user.value.name} ${user.value.paternalSurname} del sistema? Esta acción es irreversible`
  messageDialog.icon = 'delete'
  messageDialog.colorIcon = 'negative'
  messageDialog.labelBtnConfirm = 'Eliminar'
}

const showDialogActionRestore = () => {
  if (!user.value) return
  confirm.value = true
  messageDialog.action = 'restore'
  messageDialog.message = `¿Deseas reactivar al usuario ${user.value.name} ${user.value.paternalSurname}?`
  messageDialog.icon = 'settings_backup_restore'
  messageDialog.colorIcon = 'positive'
  messageDialog.labelBtnConfirm = 'Restaurar'
}
</script>
