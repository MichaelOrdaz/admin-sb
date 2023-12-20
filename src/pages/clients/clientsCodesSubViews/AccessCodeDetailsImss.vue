<script setup lang="ts">
import { AxiosError } from 'axios'
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
  idse: AccessCode | null
  virtualDesktop: AccessCode | null
  sipare: AccessCode | null
}
const props = defineProps<Props>()

const loading = ref(false)

const clientCodes = reactive<ClientCodesSat>({
  idse: null,
  virtualDesktop: null,
  sipare: null,
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
      const { idse, virtualDesktop, sipare } = codes
      if (idse) clientCodes.idse = idse
      if (virtualDesktop) clientCodes.virtualDesktop = virtualDesktop
      if (sipare) clientCodes.sipare = sipare
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
        Claves Instituto Mexicano del Seguro Social (IMSS)
      </div>
      <div class="text-right">
        <q-btn
          label="Editar accesos IMSS"
          color="primary"
          :to="{
            name: ROUTER_NAMES.CLIENTS_CODES_EDIT_IMSS,
            params: { clientId: client.id },
          }"
        ></q-btn>
      </div>
      <div class="row q-mt-sm q-mb-lg">
        <div class="col-12 text-weight-bold">Escritorio Virtual IMSS:</div>
        <template v-if="clientCodes.virtualDesktop">
          <div class="col-12 col-sm-6 col-md-4">
            Usuario: {{ clientCodes.virtualDesktop?.username }}
          </div>
          <div class="col-12 col-sm-6 col-md-4">
            Contraseña:
            <text-toggle-password
              :text="`${clientCodes.virtualDesktop?.code}`"
            />
          </div>
        </template>
        <div v-else class="col-12 col-sm-6 col-md-4">Sin especificar</div>
      </div>
      <div class="row q-mt-sm q-mb-lg">
        <template v-if="clientCodes.idse">
          <div class="col-12 text-weight-bold">
            IMSS desde su Empresa (IDSE):
          </div>
          <div class="col-12 col-sm-6 col-md-4">
            Usuario: {{ clientCodes.idse?.username }}
          </div>
          <div class="col-12 col-sm-6 col-md-4">
            Contraseña:
            <text-toggle-password :text="`${clientCodes.idse?.code}`" />
          </div>
        </template>
        <div v-else class="col-12 col-sm-6 col-md-4">Sin especificar</div>
      </div>
      <div class="row q-mt-sm q-mb-lg">
        <div class="col-12 text-weight-bold">
          Sistema de Pago Referenciado (SIPARE):
        </div>
        <template v-if="clientCodes.sipare">
          <div class="col-12 col-sm-6 col-md-4">
            Usuario: {{ clientCodes.sipare?.username }}
          </div>
          <div class="col-12 col-sm-6 col-md-4">
            Contraseña:
            <text-toggle-password :text="`${clientCodes.sipare?.code}`" />
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
