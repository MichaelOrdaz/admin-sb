<script setup lang="ts">
import { AxiosError } from 'axios'
import { useQuasar } from 'quasar'
import {
  Client,
  CodigosDeClienteApi,
  Configuration,
  SaveClientCodesOthersDto,
} from 'src/api-client'
import { useAuthStore } from 'src/stores/auth-store'
import { reactive, ref } from 'vue'

const $q = useQuasar()

const authStore = useAuthStore()
const configToken = new Configuration({ accessToken: authStore.token })

interface Props {
  client: Client
}

interface AccessCodeEditOthers {
  code: string
  username: string
  email: string
  isPwd: boolean
}

interface AccessCodeEditOthersCodes extends AccessCodeEditOthers {
  id?: number | null | undefined
  name: string
  expeditionDate: string
  dueDate: string
}

interface ClientCodesOthers {
  infonavit: AccessCodeEditOthers
  isn: AccessCodeEditOthers
  others: AccessCodeEditOthersCodes[]
}

const props = defineProps<Props>()

const loading = ref(false)

const baseClientCodeEdit: AccessCodeEditOthers = {
  code: '',
  username: '',
  email: '',
  isPwd: true,
}

const baseClientCodeEditOtherCode: AccessCodeEditOthersCodes = {
  ...baseClientCodeEdit,
  id: null,
  name: '',
  expeditionDate: '',
  dueDate: '',
}

const clientCodes = reactive<ClientCodesOthers>({
  infonavit: { ...baseClientCodeEdit },
  isn: { ...baseClientCodeEdit },
  others: [],
})

const getClientCodes = async () => {
  if (props.client === null || !props.client.id) return

  loading.value = true
  try {
    const response = await new CodigosDeClienteApi(
      configToken
    ).clientCodesControllerFindAllCodesByClient(+props.client.id, 'OTRA')

    const codes = response.data.data?.clientCodes
    if (codes) {
      const { infonavit, isn, others } = codes

      clientCodes.infonavit.code = infonavit?.code || ''
      clientCodes.infonavit.username = infonavit?.username || ''
      clientCodes.infonavit.email = infonavit?.email || ''

      clientCodes.isn.code = isn?.code || ''
      clientCodes.isn.username = isn?.username || ''

      if (others) {
        clientCodes.others = others.map((item) => ({
          id: item.id || null,
          name: item.name,
          username: item.username || '',
          email: item.email || '',
          code: item.code || '',
          expeditionDate: item.expeditionDate || '',
          dueDate: item.dueDate || '',
          isPwd: true,
        }))
      }
    }

    loading.value = false
  } catch (e) {
    if (e instanceof AxiosError) {
      loading.value = false
      $q.notify({
        color: 'negative',
        message: e.response?.data.message,
      })
    }
  }
}

getClientCodes()

const onSubmit = async () => {
  const inputInfonavitLength = [
    clientCodes.infonavit.code.length,
    clientCodes.infonavit.username.length,
    clientCodes.infonavit.email?.length,
  ]
  if (
    !inputInfonavitLength.every((item) => item > 0) &&
    !inputInfonavitLength.every((item) => item === 0) &&
    inputInfonavitLength.some((item) => item === 0)
  ) {
    $q.notify({
      color: 'negative',
      message: 'Los campos de INFONAVIT son obligatorios',
    })
    return
  }

  const inputISNLength = [
    clientCodes.isn.code.length,
    clientCodes.isn.username.length,
  ]
  if (
    !inputISNLength.every((item) => item > 0) &&
    !inputISNLength.every((item) => item === 0) &&
    inputISNLength.some((item) => item === 0)
  ) {
    $q.notify({
      color: 'negative',
      message: 'Los campos de ISN (% sobre nominas) son obligatorios',
    })
    return
  }

  const errors = clientCodes.others.map((itemCode, index) => {
    if (itemCode.code.length === 0) {
      $q.notify({
        color: 'negative',
        message:
          'La contraseña es un campo obligatorio para el acceso ' + index,
      })
      return false
    }
    if (itemCode.code.length && itemCode.name.length === 0) {
      $q.notify({
        color: 'negative',
        message: 'Debes asignar un nombre al acceso ' + index,
      })
      return false
    }
    return true
  })

  if (errors.some((item) => item === false)) {
    return
  }

  const requestCodes: SaveClientCodesOthersDto = {
    infonavit: null,
    isn: null,
    others: [],
  }

  if (clientCodes.infonavit.code) {
    requestCodes.infonavit = {
      code: clientCodes.infonavit.code,
      user: clientCodes.infonavit.username,
      email: clientCodes.infonavit.email,
    }
  }

  if (clientCodes.isn.code) {
    requestCodes.isn = {
      code: clientCodes.isn.code,
      user: clientCodes.isn.username,
    }
  }

  if (clientCodes.others.length) {
    requestCodes.others = clientCodes.others.map((itemCode) => ({
      id: itemCode.id || null,
      name: itemCode.name,
      code: itemCode.code,
      user: itemCode.username || null,
      expeditionDate: itemCode.expeditionDate || null,
      dueDate: itemCode.dueDate || null,
      email: itemCode.email || null,
    }))
  }

  try {
    const response = await new CodigosDeClienteApi(
      configToken
    ).clientCodesControllerSaveCodesOthers(
      props.client.id as number,
      requestCodes
    )

    $q.notify({
      color: 'positive',
      message: 'Los accesos se guardaron correctamente',
    })
  } catch (e) {
    if (e instanceof AxiosError) {
      loading.value = false
      $q.notify({
        color: 'negative',
        message: e.response?.data.message,
      })
    } else if (e instanceof Error) {
      $q.notify({
        color: 'negative',
        message: e.message,
      })
    }
  }
}
</script>
<template>
  <q-card flat>
    <q-card-section>
      <q-form @submit="onSubmit">
        <div class="row q-col-gutter-sm">
          <div class="col-12 text-weight-bold">
            <div class="row">
              <div class="col">INFONAVIT:</div>
              <div class="col-auto">
                <q-icon
                  name="delete"
                  size="sm"
                  class="cursor-pointer"
                  @click="clientCodes.infonavit = { ...baseClientCodeEdit }"
                ></q-icon>
              </div>
            </div>
          </div>

          <div class="col-12 col-sm-6 col-md-4">
            <q-input
              filled
              label="Nombre de usuario"
              v-model="clientCodes.infonavit.username"
              color="white"
            >
            </q-input>
          </div>
          <div class="col-12 col-sm-6 col-md-4">
            <q-input
              filled
              label="Correo electrónico"
              v-model="clientCodes.infonavit.email"
              color="white"
            >
            </q-input>
          </div>
          <div class="col-12 col-sm-6 col-md-4">
            <q-input
              filled
              label="contraseña"
              v-model="clientCodes.infonavit.code"
              :type="clientCodes.infonavit.isPwd ? 'password' : 'text'"
              color="white"
            >
              <template v-slot:append>
                <q-icon
                  :name="
                    clientCodes.infonavit.isPwd
                      ? 'visibility_off'
                      : 'visibility'
                  "
                  class="cursor-pointer"
                  @click="
                    clientCodes.infonavit.isPwd = !clientCodes.infonavit.isPwd
                  "
                />
              </template>
            </q-input>
          </div>
        </div>

        <div class="row q-col-gutter-sm q-my-md">
          <div class="col-12 text-weight-bold">
            <div class="row">
              <div class="col">ISN (% sobre nominas):</div>
              <div class="col-auto">
                <q-icon
                  name="delete"
                  size="sm"
                  class="cursor-pointer"
                  @click="clientCodes.isn = { ...baseClientCodeEdit }"
                ></q-icon>
              </div>
            </div>
          </div>

          <div class="col-12 col-sm-6 col-md-4">
            <q-input
              filled
              label="Nombre de usuario"
              v-model="clientCodes.isn.username"
              color="white"
            >
            </q-input>
          </div>
          <div class="col-12 col-sm-6 col-md-4">
            <q-input
              filled
              label="contraseña"
              v-model="clientCodes.isn.code"
              :type="clientCodes.isn.isPwd ? 'password' : 'text'"
              color="white"
            >
              <template v-slot:append>
                <q-icon
                  :name="
                    clientCodes.isn.isPwd ? 'visibility_off' : 'visibility'
                  "
                  class="cursor-pointer"
                  @click="clientCodes.isn.isPwd = !clientCodes.isn.isPwd"
                />
              </template>
            </q-input>
          </div>
        </div>

        <q-separator />

        <q-btn
          color="primary"
          label="agregar acceso"
          class="q-mt-md"
          @click="clientCodes.others.push({ ...baseClientCodeEditOtherCode })"
        ></q-btn>

        <div
          v-for="(otherCode, index) in clientCodes.others"
          :key="index"
          class="row q-col-gutter-sm q-my-md"
        >
          <div class="col-12 text-weight-bold">
            <div class="row">
              <div class="col">Acceso {{ index + 1 }}:</div>
              <div class="col-auto">
                <q-icon
                  name="delete"
                  size="sm"
                  class="cursor-pointer"
                  @click="clientCodes.others.splice(index, 1)"
                ></q-icon>
              </div>
            </div>
          </div>

          <div class="col-12 col-sm-6 col-md-4">
            <q-input
              filled
              label="Nombre del acceso"
              v-model="otherCode.name"
              color="white"
            >
            </q-input>
          </div>
          <div class="col-12 col-sm-6 col-md-4">
            <q-input
              filled
              label="Nombre de usuario"
              v-model="otherCode.username"
              color="white"
            >
            </q-input>
          </div>
          <div class="col-12 col-sm-6 col-md-4">
            <q-input
              filled
              label="correo electrónico"
              v-model="otherCode.email"
              color="white"
            >
            </q-input>
          </div>
          <div class="col-12 col-sm-6 col-md-4">
            <q-input
              filled
              label="contraseña"
              v-model="otherCode.code"
              :type="otherCode.isPwd ? 'password' : 'text'"
              color="white"
            >
              <template v-slot:append>
                <q-icon
                  :name="otherCode.isPwd ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="otherCode.isPwd = !otherCode.isPwd"
                />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-sm-6 col-md-4">
            <q-input
              filled
              label="Fecha de emisión"
              v-model="otherCode.expeditionDate"
              color="white"
              type="date"
            >
            </q-input>
          </div>
          <div class="col-12 col-sm-6 col-md-4">
            <q-input
              filled
              label="Fecha de expiración"
              v-model="otherCode.dueDate"
              color="white"
              type="date"
            >
            </q-input>
          </div>
        </div>

        <div>
          <q-btn label="Guarda cambios" type="submit" color="primary" />
          <q-btn
            class="q-ml-md"
            label="cancelar"
            color="grey-9"
            type="reset"
            @click="$router.back()"
          />
        </div>
      </q-form>
    </q-card-section>

    <q-inner-loading :showing="loading">
      <q-spinner-gears size="50px" color="primary" />
    </q-inner-loading>
  </q-card>
</template>
