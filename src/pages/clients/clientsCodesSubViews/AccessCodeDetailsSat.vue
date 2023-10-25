<script setup lang="ts">
import { AxiosError } from 'axios'
import dayjs from 'dayjs'
import { useQuasar } from 'quasar'
import {
  AccessCode,
  Client,
  CodigosDeClienteApi,
  Configuration,
} from 'src/api-client'
import TextTogglePassword from 'src/components/TextTogglePassword.vue'
import { ROUTER_NAMES } from 'src/router'
import { useAuthStore } from 'src/stores/auth-store'
import { reactive, ref } from 'vue'

const $q = useQuasar()

const authStore = useAuthStore()
const configToken = new Configuration({ accessToken: authStore.token })

interface Props {
  client: Client
}

interface ClientCodesSat {
  ciec: AccessCode | null
  efirma: AccessCode | null
  efirmaRep: AccessCode | null
  csd: AccessCode | null
}
const props = defineProps<Props>()

const loading = ref(false)

const clientCodes = reactive<ClientCodesSat>({
  ciec: null,
  efirma: null,
  efirmaRep: null,
  csd: null,
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
      if (ciec) clientCodes.ciec = ciec
      if (csd) clientCodes.csd = csd
      if (efirma) clientCodes.efirma = efirma
      if (efirmaRep) clientCodes.efirmaRep = efirmaRep
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
</script>

<template>
  <q-card flat>
    <q-card-section>
      <div
        class="text-weight-bold q-mb-md bg-blue-grey-6 q-pa-xs rounded-borders"
      >
        Claves Servicio de Administración Tributaria (SAT)
      </div>
      <div class="text-right">
        <q-btn
          label="Editar accesos SAT"
          color="primary"
          :to="{
            name: ROUTER_NAMES.CLIENTS_CODES_EDIT_SAT,
            params: { clientId: client.id },
          }"
        ></q-btn>
      </div>
      <div class="row q-mt-sm q-mb-lg">
        <div class="col-12 text-weight-bold">E.Firma:</div>
        <template v-if="clientCodes.efirma">
          <div class="col-12 col-sm-6 col-md-4">
            Contraseña:
            <text-toggle-password :text="`${clientCodes.efirma?.code}`" />
          </div>
          <div class="col-12 col-sm-6 col-md-4">
            Fecha de emisión:
            {{ dayjs(clientCodes.efirma?.expeditionDate).format('YYYY-MM-DD') }}
          </div>
          <div class="col-12 col-sm-6 col-md-4">
            Fecha de expiración:
            {{ dayjs(clientCodes.efirma?.dueDate).format('YYYY-MM-DD') }}
          </div>
        </template>
        <div v-else class="col-12 col-sm-6 col-md-4">Sin especificar</div>
      </div>
      <div class="row q-mt-sm q-mb-lg">
        <div class="col-12 text-weight-bold">
          E.Firma del Representante Legal:
        </div>
        <template v-if="clientCodes.efirmaRep">
          <div class="col-12 col-sm-6 col-md-4">
            Contraseña:
            <text-toggle-password :text="`${clientCodes.efirmaRep?.code}`" />
          </div>
          <div class="col-12 col-sm-6 col-md-4">
            Fecha de emisión:
            {{
              dayjs(clientCodes.efirmaRep?.expeditionDate).format('YYYY-MM-DD')
            }}
          </div>
          <div class="col-12 col-sm-6 col-md-4">
            Fecha de expiración:
            {{ dayjs(clientCodes.efirmaRep?.dueDate).format('YYYY-MM-DD') }}
          </div>
        </template>
        <div v-else class="col-12 col-sm-6 col-md-4">Sin especificar</div>
      </div>
      <div class="row q-mt-sm q-mb-lg">
        <div class="col-12 text-weight-bold">Certificado de Sello Digital:</div>
        <template v-if="clientCodes.csd">
          <div class="col-12 col-sm-6 col-md-4">
            Contraseña:
            <text-toggle-password :text="`${clientCodes.csd?.code}`" />
          </div>
          <div class="col-12 col-sm-6 col-md-4">
            Fecha de emisión:
            {{ dayjs(clientCodes.csd?.expeditionDate).format('YYYY-MM-DD') }}
          </div>
          <div class="col-12 col-sm-6 col-md-4">
            Fecha de expiración:
            {{ dayjs(clientCodes.csd?.dueDate).format('YYYY-MM-DD') }}
          </div>
        </template>
        <div v-else class="col-12 col-sm-6 col-md-4">Sin especificar</div>
      </div>
      <div class="row q-mt-sm q-mb-lg">
        <div class="col-12 text-weight-bold">
          Clave de identificación electrónica (CIEC):
        </div>
        <template v-if="clientCodes.ciec">
          <div class="col-12 col-sm-6 col-md-4">
            Contraseña:
            <text-toggle-password :text="`${clientCodes.ciec?.code}`" />
          </div>

          <div class="col-12 col-sm-6 col-md-4">
            Usuario: {{ clientCodes.ciec?.username }}
          </div>
        </template>
        <div v-else class="col-12 col-sm-6 col-md-4">Sin especificar</div>
      </div>
    </q-card-section>

    <q-inner-loading :showing="loading">
      <q-spinner-gears size="50px" color="primary" />
    </q-inner-loading>
  </q-card>
</template>
