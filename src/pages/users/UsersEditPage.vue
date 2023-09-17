<template>
  <q-page class="q-pa-md">
    <div class="row">
      <div class="col-xs-12">
        <q-card>
          <q-card-actions>
            <q-btn
              color="white"
              icon="arrow_back"
              flat
              rounded
              @click="$router.back()"
            >
            </q-btn>
          </q-card-actions>
          <q-card-section class="text-weight-bold">
            Edición de datos de usuario
          </q-card-section>

          <q-card-section v-if="user">
            <q-form @submit="onSubmit" greedy ref="userForm" @reset="resetForm">
              <div class="row q-col-gutter-sm">
                <div class="col-12">
                  <q-input
                    color="white"
                    filled
                    v-model="createUser.name"
                    label="Nombre *"
                    lazy-rules
                    :rules="[
                      (val) => (val && val.length > 0) || 'Campo requerido',
                    ]"
                    maxlength="120"
                  />
                </div>

                <div class="col-sm-6">
                  <q-input
                    color="white"
                    filled
                    v-model="createUser.paternalSurname"
                    label="Apellido Paterno *"
                    lazy-rules
                    :rules="[
                      (val) => (val && val.length > 0) || 'Campo requerido',
                    ]"
                    maxlength="100"
                  />
                </div>

                <div class="col-sm-6">
                  <q-input
                    color="white"
                    filled
                    v-model="createUser.maternalSurname"
                    label="Apellido Materno"
                    maxlength="100"
                  />
                </div>

                <div class="col-sm-6">
                  <q-input
                    color="white"
                    filled
                    v-model="createUser.email"
                    label="E-mail *"
                    lazy-rules
                    :rules="[
                      (val) => (val && val.length > 0) || 'Campo requerido',
                      'email',
                    ]"
                    type="email"
                    maxlength="100"
                  />
                </div>

                <div class="col-sm-6">
                  <q-input
                    color="white"
                    filled
                    v-model="createUser.phone"
                    label="Teléfono"
                    type="tel"
                    maxlength="14"
                  />
                </div>

                <div class="col-sm-6">
                  <q-select
                    color="white"
                    filled
                    v-model="createUser.role"
                    label="Rol *"
                    :options="Object.freeze(roles)"
                    :rules="[(val) => !!val || 'Campo requerido']"
                    emit-value
                    map-options
                  />
                </div>
              </div>

              <div class="row q-my-sm">
                <div class="col-12">
                  <q-btn
                    icon="save"
                    label="Guardar cliente"
                    type="submit"
                    color="primary"
                  />

                  <q-btn
                    class="q-ml-sm"
                    label="cancelar"
                    color="grey-9"
                    type="reset"
                    @click="$router.back()"
                  />
                </div>
              </div>
            </q-form>
          </q-card-section>
          <q-inner-loading :showing="loading">
            <q-spinner-gears size="50px" color="white" />
          </q-inner-loading>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { QForm, useMeta, useQuasar } from 'quasar'
import { CreateUserDto, User, UsersApi } from 'src/api-client'
import { ref, watch } from 'vue'
import { AxiosError } from 'axios'
import { useRoute } from 'vue-router'

const $q = useQuasar()
const route = useRoute()
useMeta({
  title: 'Usuarios::S&B',
})

const loading = ref(false)
const user = ref<User | null>(null)

const userForm = ref<QForm | null>(null)

const roles = [
  {
    label: 'Administrador',
    value: 'admin',
  },
  {
    label: 'Operativo',
    value: 'operativo',
  },
]

const createUser = ref<Partial<CreateUserDto>>({
  name: '',
  paternalSurname: '',
  maternalSurname: '',
  email: '',
  phone: '',
  role: '',
})

const resetForm = () => {
  createUser.value.name = ''
  createUser.value.paternalSurname = ''
  createUser.value.maternalSurname = ''
  createUser.value.email = ''
  createUser.value.phone = ''
  createUser.value.role = ''
}

const onSubmit = async () => {
  const createUserPayload: CreateUserDto = {
    name: createUser.value.name as string,
    paternalSurname: createUser.value.paternalSurname,
    maternalSurname: createUser.value.maternalSurname,
    email: createUser.value.email as string,
    phone: createUser.value.phone,
    role: createUser.value.role as string,
  }

  try {
    Object.keys(createUserPayload).forEach((prop) => {
      if (createUserPayload[prop as keyof CreateUserDto] === '') {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        createUserPayload[prop as keyof CreateUserDto] = null
      }
    })

    await new UsersApi().usersControllerUpdateUser(user.value?.id as number, {
      ...createUserPayload,
    })
    $q.notify({
      color: 'positive',
      message: 'El usuario fue guardado con exito',
    })

    resetForm()
    if (userForm.value) {
      userForm.value.reset()
      userForm.value.resetValidation()
    }
  } catch (e) {
    if (e instanceof AxiosError) {
      $q.notify({
        color: 'negative',
        message: Array.isArray(e.response?.data?.message)
          ? e.response?.data?.message.join(', ')
          : e.response?.data?.message,
      })
      return
    }
    $q.notify({
      color: 'negative',
      message: 'Error desconocido, reintenta',
    })
  }
}

// recuperar datos del cliente
const getUser = async () => {
  loading.value = true
  const response = await new UsersApi().usersControllerFindOne(
    +route.params.userId
  )
  user.value = response.data.data?.user as User
  loading.value = false

  createUser.value.name = user.value.name
  createUser.value.paternalSurname = user.value.paternalSurname
  createUser.value.maternalSurname = user.value.maternalSurname
  createUser.value.email = user.value.email
  createUser.value.phone = user.value.phone
  createUser.value.role = user.value.role
}

getUser()

watch(
  () => route.params,
  (to) => {
    if (to?.userId) getUser()
  }
)
</script>
