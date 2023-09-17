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
            <h5 class="q-my-none">Información del usuario</h5>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn
              color="primary"
              icon="edit"
              label="editar"
              :to="{
                name: ROUTER_NAMES.USERS_EDIT,
                params: { userId: user?.id },
              }"
            />
            <q-btn color="primary" icon="key" label="Renovar contraseña" />
            <q-btn
              color="yellow"
              text-color="black"
              icon="remove_circle"
              label="desactivar"
              @click="confirm = true"
            />
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
        <q-card-section class="row items-center">
          <q-avatar icon="remove_circle" color="negative" text-color="white" />
          <span class="q-ml-sm" v-if="user"
            >Deseas desactivar al cliente {{ user.name }}
            {{ user?.paternalSurname }}.</span
          >
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            label="Desactivar"
            color="negative"
            v-close-popup
            @click="deleteUser"
          />
          <q-btn flat label="cancelar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { useMeta, useQuasar } from 'quasar'
import { User, UsersApi } from 'src/api-client'
import { ROUTER_NAMES } from 'src/router'
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()

useMeta({
  title: 'Usuarios::S&B',
})

const confirm = ref(false)

const loading = ref(false)
const user = ref<User | null>(null)

const getUser = async () => {
  loading.value = true
  const response = await new UsersApi().usersControllerFindOne(
    +route.params.userId
  )
  user.value = response.data.data?.user as User
  loading.value = false
}

getUser()

watch(
  () => route.params,
  (to) => {
    if (to?.userId) getUser()
  }
)

const deleteUser = async () => {
  if (user.value) {
    try {
      const response = await new UsersApi().usersControllerSoftRemoveUser(
        user.value?.id as number
      )

      router.push({ name: ROUTER_NAMES.USERS_LIST })

      $q.notify({
        color: 'primary',
        message: 'El usuario fue desactivado correctamente',
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