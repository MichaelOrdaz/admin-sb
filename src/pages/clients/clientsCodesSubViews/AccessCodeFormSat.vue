<script setup lang="ts">
import { AxiosError } from 'axios'
import dayjs from 'dayjs'
import { useQuasar } from 'quasar'
import {
  Client,
  CodigosDeClienteApi,
  Configuration,
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

interface AccessCodeEdit {
  code: string
  username: string
  expeditionDate: string
  dueDate: string
  isPwd: boolean
}

interface ClientCodesSat {
  ciec: AccessCodeEdit
  efirma: AccessCodeEdit
  efirmaRep: AccessCodeEdit
  csd: AccessCodeEdit
}

const props = defineProps<Props>()

const loading = ref(false)
const baseClientCodeEdit: AccessCodeEdit = {
  code: '',
  username: '',
  expeditionDate: '',
  dueDate: '',
  isPwd: true,
}

const clientCodes = reactive<ClientCodesSat>({
  ciec: { ...baseClientCodeEdit },
  efirma: { ...baseClientCodeEdit },
  efirmaRep: { ...baseClientCodeEdit },
  csd: { ...baseClientCodeEdit },
})

const getClientCodes = async () => {
  if (props.client === null || !props.client.id) return

  loading.value = true
  try {
    const response = await new CodigosDeClienteApi(
      configToken
    ).clientCodesControllerFindAllCodesByClient(+props.client.id, 'SAT')

    const codes = response.data.data?.clientCodes
    if (codes) {
      const { ciec, csd, efirma, efirmaRep } = codes

      clientCodes.ciec.code = ciec?.code || ''
      clientCodes.ciec.username = ciec?.username || ''

      clientCodes.csd.code = csd?.code || ''
      clientCodes.csd.dueDate = csd?.dueDate
        ? dayjs(csd?.dueDate).format('YYYY-MM-DD')
        : ''
      clientCodes.csd.expeditionDate = csd?.expeditionDate
        ? dayjs(csd?.expeditionDate).format('YYYY-MM-DD')
        : ''

      clientCodes.efirma.code = efirma?.code || ''
      clientCodes.efirma.dueDate = efirma?.dueDate
        ? dayjs(efirma?.dueDate).format('YYYY-MM-DD')
        : ''
      clientCodes.efirma.expeditionDate = efirma?.expeditionDate
        ? dayjs(efirma?.expeditionDate).format('YYYY-MM-DD')
        : ''

      clientCodes.efirmaRep.code = efirmaRep?.code || ''
      clientCodes.efirmaRep.dueDate = efirmaRep?.dueDate
        ? dayjs(efirmaRep?.dueDate).format('YYYY-MM-DD')
        : ''
      clientCodes.efirmaRep.expeditionDate = efirmaRep?.expeditionDate
        ? dayjs(efirmaRep?.expeditionDate).format('YYYY-MM-DD')
        : ''
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
  /**
    validar efirma
    emision, expiracion codigo
    vacio vacio vacio enviar null
    tiene tiene tiene enviar

    vacio vacio tiene error
    vacio tiene tiene error
    vacio tiene vacio error
    tiene vacio vacio error
   */
  const inputEfirmaLength = [
    clientCodes.efirma.code.length,
    clientCodes.efirma.expeditionDate.length,
    clientCodes.efirma.dueDate.length,
  ]

  if (
    !inputEfirmaLength.every((item) => item > 0) &&
    !inputEfirmaLength.every((item) => item === 0) &&
    inputEfirmaLength.some((item) => item === 0)
  ) {
    $q.notify({
      color: 'negative',
      message: 'Los campos de efirma son obligatorios',
    })
    return
  }

  const inputEfirmaRepLength = [
    clientCodes.efirmaRep.code.length,
    clientCodes.efirmaRep.expeditionDate.length,
    clientCodes.efirmaRep.dueDate.length,
  ]

  if (
    !inputEfirmaRepLength.every((item) => item > 0) &&
    !inputEfirmaRepLength.every((item) => item === 0) &&
    inputEfirmaRepLength.some((item) => item === 0)
  ) {
    $q.notify({
      color: 'negative',
      message: 'Los campos de efirma del representante legal son obligatorios',
    })
    return
  }

  const inputCSDLength = [
    clientCodes.csd.code.length,
    clientCodes.csd.expeditionDate.length,
    clientCodes.csd.dueDate.length,
  ]

  if (
    !inputCSDLength.every((item) => item > 0) &&
    !inputCSDLength.every((item) => item === 0) &&
    inputCSDLength.some((item) => item === 0)
  ) {
    $q.notify({
      color: 'negative',
      message: 'Los campos de Certificado de Sello Digital son obligatorios',
    })
    return
  }

  const inputCIECLength = [
    clientCodes.ciec.code.length,
    clientCodes.ciec.username.length,
  ]
  if (
    !inputCIECLength.every((item) => item > 0) &&
    !inputCIECLength.every((item) => item === 0) &&
    inputCIECLength.some((item) => item === 0)
  ) {
    $q.notify({
      color: 'negative',
      message: 'Los campos de CIEC son obligatorios',
    })
    return
  }

  const requestCodes = {
    efirma: null as SaveClientCodesSatDto['efirma'] | null,
    efirmaRep: null as SaveClientCodesSatDto['efirmaRep'] | null,
    csd: null as SaveClientCodesSatDto['digitalCertificate'] | null,
    ciec: null as SaveClientCodesSatDto['ciec'] | null,
  }

  if (clientCodes.efirma.code) {
    requestCodes.efirma = {
      code: clientCodes.efirma.code,
      expeditionDate: dayjs(clientCodes.efirma.expeditionDate)
        .toDate()
        .toISOString(),
      dueDate: dayjs(clientCodes.efirma.dueDate).toDate().toISOString(),
    }
  }
  if (clientCodes.efirmaRep.code) {
    requestCodes.efirmaRep = {
      code: clientCodes.efirmaRep.code,
      expeditionDate: dayjs(clientCodes.efirmaRep.expeditionDate)
        .toDate()
        .toISOString(),
      dueDate: dayjs(clientCodes.efirmaRep.dueDate).toDate().toISOString(),
    }
  }
  if (clientCodes.csd.code) {
    requestCodes.csd = {
      code: clientCodes.csd.code,
      expeditionDate: dayjs(clientCodes.csd.expeditionDate)
        .toDate()
        .toISOString(),
      dueDate: dayjs(clientCodes.csd.dueDate).toDate().toISOString(),
    }
  }
  if (clientCodes.ciec.code) {
    requestCodes.ciec = {
      code: clientCodes.ciec.code,
      user: clientCodes.ciec.username,
    }
  }

  try {
    const response = await new CodigosDeClienteApi(
      configToken
    ).clientCodesControllerSaveCodesSat(props.client.id as number, requestCodes)

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
              <div class="col">E.Firma:</div>
              <div class="col-auto">
                <q-icon
                  name="delete"
                  size="sm"
                  class="cursor-pointer"
                  @click="clientCodes.efirma = { ...baseClientCodeEdit }"
                ></q-icon>
              </div>
            </div>
          </div>
          <div class="col-12 col-sm-6 col-md-4">
            <q-input
              filled
              label="contraseña"
              v-model="clientCodes.efirma.code"
              :type="clientCodes.efirma.isPwd ? 'password' : 'text'"
              color="white"
            >
              <template v-slot:append>
                <q-icon
                  :name="
                    clientCodes.efirma.isPwd ? 'visibility_off' : 'visibility'
                  "
                  class="cursor-pointer"
                  @click="clientCodes.efirma.isPwd = !clientCodes.efirma.isPwd"
                />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-sm-6 col-md-4">
            <q-input
              filled
              label="Fecha de emisión"
              v-model="clientCodes.efirma.expeditionDate"
              color="white"
              type="date"
            >
            </q-input>
          </div>
          <div class="col-12 col-sm-6 col-md-4">
            <q-input
              filled
              label="Fecha de expiración"
              v-model="clientCodes.efirma.dueDate"
              color="white"
              type="date"
            >
            </q-input>
          </div>
        </div>

        <div class="row q-col-gutter-sm q-my-md">
          <div class="col-12 text-weight-bold">
            <div class="row">
              <div class="col">E.Firma Representante Legal:</div>
              <div class="col-auto">
                <q-icon
                  name="delete"
                  size="sm"
                  class="cursor-pointer"
                  @click="clientCodes.efirmaRep = { ...baseClientCodeEdit }"
                ></q-icon>
              </div>
            </div>
          </div>
          <div class="col-12 col-sm-6 col-md-4">
            <q-input
              filled
              label="contraseña"
              v-model="clientCodes.efirmaRep.code"
              :type="clientCodes.efirmaRep.isPwd ? 'password' : 'text'"
              color="white"
            >
              <template v-slot:append>
                <q-icon
                  :name="
                    clientCodes.efirmaRep.isPwd
                      ? 'visibility_off'
                      : 'visibility'
                  "
                  class="cursor-pointer"
                  @click="
                    clientCodes.efirmaRep.isPwd = !clientCodes.efirmaRep.isPwd
                  "
                />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-sm-6 col-md-4">
            <q-input
              filled
              label="Fecha de emisión"
              v-model="clientCodes.efirmaRep.expeditionDate"
              color="white"
              type="date"
            >
            </q-input>
          </div>
          <div class="col-12 col-sm-6 col-md-4">
            <q-input
              filled
              label="Fecha de expiración"
              v-model="clientCodes.efirmaRep.dueDate"
              color="white"
              type="date"
            >
            </q-input>
          </div>
        </div>

        <div class="row q-col-gutter-sm q-my-md">
          <div class="col-12 text-weight-bold">
            <div class="row">
              <div class="col">Certificado de Sello Digital:</div>
              <div class="col-auto">
                <q-icon
                  name="delete"
                  size="sm"
                  class="cursor-pointer"
                  @click="clientCodes.csd = { ...baseClientCodeEdit }"
                ></q-icon>
              </div>
            </div>
          </div>
          <div class="col-12 col-sm-6 col-md-4">
            <q-input
              filled
              label="contraseña"
              v-model="clientCodes.csd.code"
              :type="clientCodes.csd.isPwd ? 'password' : 'text'"
              color="white"
            >
              <template v-slot:append>
                <q-icon
                  :name="
                    clientCodes.csd.isPwd ? 'visibility_off' : 'visibility'
                  "
                  class="cursor-pointer"
                  @click="clientCodes.csd.isPwd = !clientCodes.csd.isPwd"
                />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-sm-6 col-md-4">
            <q-input
              filled
              label="Fecha de emisión"
              v-model="clientCodes.csd.expeditionDate"
              color="white"
              type="date"
            >
            </q-input>
          </div>
          <div class="col-12 col-sm-6 col-md-4">
            <q-input
              filled
              label="Fecha de expiración"
              v-model="clientCodes.csd.dueDate"
              color="white"
              type="date"
            >
            </q-input>
          </div>
        </div>

        <div class="row q-col-gutter-sm q-my-md">
          <div class="col-12 text-weight-bold">
            <div class="row">
              <div class="col">Clave de identificación electrónica (CIEC):</div>
              <div class="col-auto">
                <q-icon
                  name="delete"
                  size="sm"
                  class="cursor-pointer"
                  @click="clientCodes.ciec = { ...baseClientCodeEdit }"
                ></q-icon>
              </div>
            </div>
          </div>
          <div class="col-12 col-sm-6 col-md-4">
            <q-input
              filled
              label="Usuario"
              v-model="clientCodes.ciec.username"
              color="white"
            >
            </q-input>
          </div>
          <div class="col-12 col-sm-6 col-md-4">
            <q-input
              filled
              label="contraseña"
              v-model="clientCodes.ciec.code"
              :type="clientCodes.ciec.isPwd ? 'password' : 'text'"
              color="white"
            >
              <template v-slot:append>
                <q-icon
                  :name="
                    clientCodes.ciec.isPwd ? 'visibility_off' : 'visibility'
                  "
                  class="cursor-pointer"
                  @click="clientCodes.ciec.isPwd = !clientCodes.ciec.isPwd"
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
