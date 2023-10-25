<script setup lang="ts">
import { AxiosError } from 'axios'
import dayjs from 'dayjs'
import { useQuasar } from 'quasar'
import {
  Client,
  CodigosDeClienteApi,
  Configuration,
  SaveClientCodesImssDto,
  SaveClientCodesSatDto,
} from 'src/api-client'
import { useAuthStore } from 'src/stores/auth-store'
import { reactive, ref } from 'vue'

const $q = useQuasar()

const authStore = useAuthStore()
const configToken = new Configuration({ accessToken: authStore.token })

interface Props {
  client: Client
}

interface AccessCodeEditImss {
  code: string
  username: string
  isPwd: boolean
}

interface ClientCodesImss {
  imssCertificate: AccessCodeEditImss
  idse: AccessCodeEditImss
  virtualDesktop: AccessCodeEditImss
  sipare: AccessCodeEditImss
}

const props = defineProps<Props>()

const loading = ref(false)
const baseClientCodeEdit: AccessCodeEditImss = {
  code: '',
  username: '',
  isPwd: true,
}

const clientCodes = reactive<ClientCodesImss>({
  imssCertificate: { ...baseClientCodeEdit },
  idse: { ...baseClientCodeEdit },
  virtualDesktop: { ...baseClientCodeEdit },
  sipare: { ...baseClientCodeEdit },
})

const getClientCodes = async () => {
  if (props.client === null || !props.client.id) return

  loading.value = true
  try {
    const response = await new CodigosDeClienteApi(
      configToken
    ).clientCodesControllerFindAllCodesByClient(+props.client.id, 'IMSS')

    const codes = response.data.data?.clientCodes
    if (codes) {
      const { sipare, imssCertificate, idse, virtualDesktop } = codes

      clientCodes.imssCertificate.code = imssCertificate?.code || ''
      clientCodes.imssCertificate.username = imssCertificate?.username || ''

      clientCodes.idse.code = idse?.code || ''
      clientCodes.idse.username = idse?.username || ''

      clientCodes.sipare.code = sipare?.code || ''
      clientCodes.sipare.username = sipare?.username || ''

      clientCodes.virtualDesktop.code = virtualDesktop?.code || ''
      clientCodes.virtualDesktop.username = virtualDesktop?.username || ''
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
  const inputImssCertificateLength = [
    clientCodes.imssCertificate.code.length,
    clientCodes.imssCertificate.username.length,
  ]
  if (
    !inputImssCertificateLength.every((item) => item > 0) &&
    !inputImssCertificateLength.every((item) => item === 0) &&
    inputImssCertificateLength.some((item) => item === 0)
  ) {
    $q.notify({
      color: 'negative',
      message: 'Los campos de Certificado IMSS son obligatorios',
    })
    return
  }

  const inputIdseLength = [
    clientCodes.imssCertificate.code.length,
    clientCodes.imssCertificate.username.length,
  ]
  if (
    !inputIdseLength.every((item) => item > 0) &&
    !inputIdseLength.every((item) => item === 0) &&
    inputIdseLength.some((item) => item === 0)
  ) {
    $q.notify({
      color: 'negative',
      message: 'Los campos de IDSE son obligatorios',
    })
    return
  }

  const inputImssVirtualDesktopLength = [
    clientCodes.imssCertificate.code.length,
    clientCodes.imssCertificate.username.length,
  ]
  if (
    !inputImssVirtualDesktopLength.every((item) => item > 0) &&
    !inputImssVirtualDesktopLength.every((item) => item === 0) &&
    inputImssVirtualDesktopLength.some((item) => item === 0)
  ) {
    $q.notify({
      color: 'negative',
      message: 'Los campos de Escritorio Virtual IMSS son obligatorios',
    })
    return
  }

  const inputSipareLength = [
    clientCodes.imssCertificate.code.length,
    clientCodes.imssCertificate.username.length,
  ]
  if (
    !inputSipareLength.every((item) => item > 0) &&
    !inputSipareLength.every((item) => item === 0) &&
    inputSipareLength.some((item) => item === 0)
  ) {
    $q.notify({
      color: 'negative',
      message: 'Los campos de SIPARE son obligatorios',
    })
    return
  }

  const requestCodes: SaveClientCodesImssDto = {
    imssCertificate: null,
    idse: null,
    virtualDesktop: null,
    sipare: null,
  }

  if (clientCodes.imssCertificate.code) {
    requestCodes.imssCertificate = {
      code: clientCodes.imssCertificate.code,
      user: clientCodes.imssCertificate.username,
    }
  }

  if (clientCodes.idse.code) {
    requestCodes.idse = {
      code: clientCodes.idse.code,
      user: clientCodes.idse.username,
    }
  }

  if (clientCodes.virtualDesktop.code) {
    requestCodes.virtualDesktop = {
      code: clientCodes.virtualDesktop.code,
      user: clientCodes.virtualDesktop.username,
    }
  }

  if (clientCodes.sipare.code) {
    requestCodes.sipare = {
      code: clientCodes.sipare.code,
      user: clientCodes.sipare.username,
    }
  }

  try {
    const response = await new CodigosDeClienteApi(
      configToken
    ).clientCodesControllerSaveCodesImss(
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
              <div class="col">Certificado IMSS:</div>
              <div class="col-auto">
                <q-icon
                  name="delete"
                  size="sm"
                  class="cursor-pointer"
                  @click="
                    clientCodes.imssCertificate = { ...baseClientCodeEdit }
                  "
                ></q-icon>
              </div>
            </div>
          </div>

          <div class="col-12 col-sm-6 col-md-4">
            <q-input
              filled
              label="Nombre de usuario"
              v-model="clientCodes.imssCertificate.username"
              color="white"
            >
            </q-input>
          </div>
          <div class="col-12 col-sm-6 col-md-4">
            <q-input
              filled
              label="contraseña"
              v-model="clientCodes.imssCertificate.code"
              :type="clientCodes.imssCertificate.isPwd ? 'password' : 'text'"
              color="white"
            >
              <template v-slot:append>
                <q-icon
                  :name="
                    clientCodes.imssCertificate.isPwd
                      ? 'visibility_off'
                      : 'visibility'
                  "
                  class="cursor-pointer"
                  @click="
                    clientCodes.imssCertificate.isPwd =
                      !clientCodes.imssCertificate.isPwd
                  "
                />
              </template>
            </q-input>
          </div>
        </div>

        <div class="row q-col-gutter-sm q-my-md">
          <div class="col-12 text-weight-bold">
            <div class="row">
              <div class="col">IDSE:</div>
              <div class="col-auto">
                <q-icon
                  name="delete"
                  size="sm"
                  class="cursor-pointer"
                  @click="clientCodes.idse = { ...baseClientCodeEdit }"
                ></q-icon>
              </div>
            </div>
          </div>

          <div class="col-12 col-sm-6 col-md-4">
            <q-input
              filled
              label="Nombre de usuario"
              v-model="clientCodes.idse.username"
              color="white"
            >
            </q-input>
          </div>
          <div class="col-12 col-sm-6 col-md-4">
            <q-input
              filled
              label="contraseña"
              v-model="clientCodes.idse.code"
              :type="clientCodes.idse.isPwd ? 'password' : 'text'"
              color="white"
            >
              <template v-slot:append>
                <q-icon
                  :name="
                    clientCodes.idse.isPwd ? 'visibility_off' : 'visibility'
                  "
                  class="cursor-pointer"
                  @click="clientCodes.idse.isPwd = !clientCodes.idse.isPwd"
                />
              </template>
            </q-input>
          </div>
        </div>

        <div class="row q-col-gutter-sm q-my-md">
          <div class="col-12 text-weight-bold">
            <div class="row">
              <div class="col">Escritorio Virtual IMSS:</div>
              <div class="col-auto">
                <q-icon
                  name="delete"
                  size="sm"
                  class="cursor-pointer"
                  @click="
                    clientCodes.virtualDesktop = { ...baseClientCodeEdit }
                  "
                ></q-icon>
              </div>
            </div>
          </div>

          <div class="col-12 col-sm-6 col-md-4">
            <q-input
              filled
              label="Nombre de usuario"
              v-model="clientCodes.virtualDesktop.username"
              color="white"
            >
            </q-input>
          </div>
          <div class="col-12 col-sm-6 col-md-4">
            <q-input
              filled
              label="contraseña"
              v-model="clientCodes.virtualDesktop.code"
              :type="clientCodes.virtualDesktop.isPwd ? 'password' : 'text'"
              color="white"
            >
              <template v-slot:append>
                <q-icon
                  :name="
                    clientCodes.virtualDesktop.isPwd
                      ? 'visibility_off'
                      : 'visibility'
                  "
                  class="cursor-pointer"
                  @click="
                    clientCodes.virtualDesktop.isPwd =
                      !clientCodes.virtualDesktop.isPwd
                  "
                />
              </template>
            </q-input>
          </div>
        </div>

        <div class="row q-col-gutter-sm q-my-md">
          <div class="col-12 text-weight-bold">
            <div class="row">
              <div class="col">SIPARE:</div>
              <div class="col-auto">
                <q-icon
                  name="delete"
                  size="sm"
                  class="cursor-pointer"
                  @click="clientCodes.sipare = { ...baseClientCodeEdit }"
                ></q-icon>
              </div>
            </div>
          </div>

          <div class="col-12 col-sm-6 col-md-4">
            <q-input
              filled
              label="Nombre de usuario"
              v-model="clientCodes.sipare.username"
              color="white"
            >
            </q-input>
          </div>
          <div class="col-12 col-sm-6 col-md-4">
            <q-input
              filled
              label="contraseña"
              v-model="clientCodes.sipare.code"
              :type="clientCodes.sipare.isPwd ? 'password' : 'text'"
              color="white"
            >
              <template v-slot:append>
                <q-icon
                  :name="
                    clientCodes.sipare.isPwd ? 'visibility_off' : 'visibility'
                  "
                  class="cursor-pointer"
                  @click="clientCodes.sipare.isPwd = !clientCodes.sipare.isPwd"
                />
              </template>
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
