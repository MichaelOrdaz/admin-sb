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
import { useAuthStore } from 'src/stores/auth-store'
import { reactive, ref } from 'vue'

const $q = useQuasar()

const authStore = useAuthStore()
const configToken = new Configuration({ accessToken: authStore.token })

interface Props {
  client: Client
}

interface ClientCodesSat {
  infonavit: AccessCode | null
  isn: AccessCode | null
  others: AccessCode[]
}
const props = defineProps<Props>()

const loading = ref(false)

const clientCodes = reactive<ClientCodesSat>({
  infonavit: null,
  isn: null,
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
      if (infonavit) clientCodes.infonavit = infonavit
      if (isn) clientCodes.isn = isn
      if (others) clientCodes.others = others
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
        Claves Finanzas, Infonavit, Otras
      </div>
      <div class="text-right">
        <q-btn label="Editar accesos SAT" color="primary"></q-btn>
      </div>
      <div class="row q-mt-sm q-mb-lg">
        <div class="col-12 text-weight-bold">INFONAVIT:</div>
        <template v-if="clientCodes.infonavit">
          <div class="col-12 col-sm-6 col-md-4">
            Usuario: {{ clientCodes.infonavit?.username }}
          </div>
          <div class="col-12 col-sm-6 col-md-4">
            Correo electrónico: {{ clientCodes.infonavit?.email }}
          </div>
          <div class="col-12 col-sm-6 col-md-4">
            Contraseña:
            <text-toggle-password :text="`${clientCodes.infonavit?.code}`" />
          </div>
        </template>
        <div v-else class="col-12 col-sm-6 col-md-4">Sin especificar</div>
      </div>

      <div class="row q-mt-sm q-mb-lg">
        <div class="col-12 text-weight-bold">
          Impuesto sobre la Nomina (ISN 2.5%) (Finanzas):
        </div>
        <template v-if="clientCodes.isn">
          <div class="col-12 col-sm-6 col-md-4">
            Usuario: {{ clientCodes.isn?.username }}
          </div>
          <div class="col-12 col-sm-6 col-md-4">
            Contraseña:
            <text-toggle-password :text="`${clientCodes.isn?.code}`" />
          </div>
        </template>
        <div v-else class="col-12 col-sm-6 col-md-4">Sin especificar</div>
      </div>

      <q-separator />

      <div class="row q-mt-sm q-mb-lg">
        <div class="col-12 text-weight-bold">Otros accesos</div>
      </div>

      <div
        v-for="code in clientCodes.others"
        :key="code.id"
        class="row q-mt-sm q-mb-lg"
      >
        <div class="col-12 text-weight-bold">{{ code.name }}:</div>
        <div class="col-12 col-sm-6 col-md-4" v-if="code.username">
          Usuario: {{ code.username }}
        </div>
        <div class="col-12 col-sm-6 col-md-4" v-if="code.email">
          Correo electrónico: {{ code.email }}
        </div>
        <div class="col-12 col-sm-6 col-md-4" v-if="code.code">
          Contraseña:
          <text-toggle-password :text="`${code.code}`" />
        </div>
        <div class="col-12 col-sm-6 col-md-4" v-if="code.expeditionDate">
          Fecha de emisión: {{ code.expeditionDate }}
        </div>
        <div class="col-12 col-sm-6 col-md-4" v-if="code.dueDate">
          Fecha de expiración: {{ code.dueDate }}
        </div>
      </div>
    </q-card-section>

    <q-inner-loading :showing="loading">
      <q-spinner-gears size="50px" color="primary" />
    </q-inner-loading>
  </q-card>
</template>
