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
            Edición de datos del cliente
          </q-card-section>

          <q-card-section v-if="client">
            <q-form
              @submit="onSubmit"
              greedy
              ref="clientForm"
              @reset="resetForm"
            >
              <div class="row q-mb-md">
                <div class="col text-weight-bold">Datos generales</div>
              </div>

              <div class="row q-col-gutter-sm">
                <div class="col-12">
                  <q-input
                    color="white"
                    filled
                    v-model="createClient.name"
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
                    v-model="createClient.paternalSurname"
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
                    v-model="createClient.maternalSurname"
                    label="Apellido Materno"
                    maxlength="100"
                  />
                </div>

                <div class="col-sm-6">
                  <q-input
                    color="white"
                    filled
                    :model-value="createClient.rfc"
                    @update:model-value="
                      (value) => (createClient.rfc = (value as string)?.toUpperCase())
                    "
                    label="RFC *"
                    lazy-rules
                    :rules="[
                      (val) => (val && val.length > 0) || 'Campo requerido',
                      (val) => REGEX.RFC_PATTERN.test(val) || 'RFC mal formado',
                    ]"
                    maxlength="13"
                  />
                </div>

                <div class="col-sm-6">
                  <q-input
                    color="white"
                    filled
                    :model-value="createClient.curp"
                    @update:model-value="
                      (value) => (createClient.curp = (value as string)?.toUpperCase())
                    "
                    label="CURP"
                    lazy-rules
                    :rules="[
                      (val) =>
                        val.length === 0 ||
                        REGEX.CURP_PATTERN.test(val) ||
                        'CURP mal formado',
                    ]"
                    maxlength="18"
                  />
                </div>

                <div class="col-sm-6">
                  <q-input
                    color="white"
                    filled
                    v-model="createClient.email"
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
                    v-model="createClient.phone"
                    label="Teléfono"
                    type="tel"
                    maxlength="14"
                  />
                </div>

                <div class="col-sm-6">
                  <q-input
                    color="white"
                    filled
                    v-model="createClient.phone2"
                    label="Teléfono alternativo"
                    type="tel"
                    maxlength="14"
                  />
                </div>
              </div>

              <div class="row q-my-md">
                <div class="col text-weight-bold">Regimen fiscal</div>
              </div>

              <div class="row q-col-gutter-sm items-stretch">
                <template
                  v-for="(regimeClient, index) in regimesClient"
                  :key="index"
                >
                  <div class="col-xs-10">
                    <q-select
                      color="white"
                      filled
                      label="Regimen fiscal *"
                      :options="regimesOptionsMapped"
                      v-model="regimesClient[index]"
                      :rules="[
                        (val) => !!val || 'Debes seleccionar un regimen',
                      ]"
                      emit-value
                      map-options
                    />
                  </div>
                  <div class="col-auto" v-show="regimesClient.length > 1">
                    <q-btn
                      class="q-mt-md"
                      @click="regimesClient.splice(index, 1)"
                      color="negative"
                      :disable="regimesClient.length <= 1"
                      icon="clear"
                      size="sm"
                      round
                    ></q-btn>
                  </div>
                </template>

                <div class="col-xs-12">
                  <q-btn
                    @click="addRegimeItem"
                    color="primary"
                    icon="add_circle"
                    label="agregar regimen fiscal"
                    size="sm"
                  ></q-btn>
                </div>
              </div>

              <div class="row q-my-md">
                <div class="col text-weight-bold">Actividades</div>
              </div>
              <div class="row q-col-gutter-sm items-stretch">
                <template
                  v-for="(activityClient, index) in activitiesClient"
                  :key="index"
                >
                  <div class="col-xs-7">
                    <q-input
                      color="white"
                      filled
                      v-model="activityClient.activity"
                      label="Nombre de la actividad *"
                      lazy-rules
                      :rules="[
                        (val) => (val && val.length > 0) || 'Campo requerido',
                      ]"
                      maxlength="200"
                    />
                  </div>
                  <div class="col-xs-4">
                    <q-input
                      color="white"
                      filled
                      type="number"
                      v-model="activityClient.percentage"
                      label="porcentaje *"
                      lazy-rules
                      :rules="[
                        (val) => (val && val.length > 0) || 'Campo requerido',
                        (val) =>
                          val > 0 || 'El porcentaje tiene que ser mayor a 0',
                        (val) =>
                          val <= 100 ||
                          'El porcentaje tiene que ser menor de 100',
                      ]"
                    />
                  </div>
                  <div class="col-auto" v-show="activitiesClient.length > 1">
                    <q-btn
                      class="q-mt-md"
                      @click="activitiesClient.splice(index, 1)"
                      color="negative"
                      :disable="activitiesClient.length <= 1"
                      icon="clear"
                      size="sm"
                      round
                    ></q-btn>
                  </div>
                </template>

                <div class="col-xs-12">
                  <q-btn
                    @click="addActivityItem"
                    color="primary"
                    icon="add_circle"
                    label="agregar actividad"
                    size="sm"
                  ></q-btn>
                </div>
              </div>

              <div class="row q-my-md">
                <div class="col text-weight-bold">Dirección</div>
              </div>

              <div class="row q-col-gutter-sm">
                <div class="col-xs-12">
                  <q-input
                    color="white"
                    filled
                    v-model="createClient.street"
                    label="Calle *"
                    lazy-rules
                    :rules="[
                      (val) => (val && val.length > 0) || 'Campo requerido',
                    ]"
                    maxlength="200"
                  />
                </div>

                <div class="col-sm-6">
                  <q-input
                    color="white"
                    filled
                    v-model="createClient.outdoorNumber"
                    label="Número exterior"
                    maxlength="8"
                  />
                </div>

                <div class="col-sm-6">
                  <q-input
                    color="white"
                    filled
                    v-model="createClient.interiorNumber"
                    label="Número interior"
                    maxlength="8"
                  />
                </div>

                <div class="col-sm-6">
                  <q-input
                    color="white"
                    filled
                    v-model="createClient.cologne"
                    label="Colonia"
                    maxlength="120"
                  />
                </div>

                <div class="col-sm-6">
                  <q-input
                    color="white"
                    filled
                    v-model="createClient.postalCode"
                    label="Código Postal"
                    maxlength="5"
                  />
                </div>

                <div class="col-sm-6">
                  <q-input
                    color="white"
                    filled
                    v-model="createClient.province"
                    label="Ciudad"
                    maxlength="100"
                  />
                </div>

                <div class="col-sm-6">
                  <q-select
                    color="white"
                    filled
                    v-model="createClient.state"
                    label="Entidad federativa *"
                    :options="Object.freeze(STATES.map((i) => i.name))"
                    :rules="[(val) => !!val || 'Campo requerido']"
                  />
                </div>
              </div>

              <div class="row q-my-md">
                <div class="col text-weight-bold">
                  Datos representante legal
                </div>
              </div>

              <div class="row q-col-gutter-sm">
                <div class="col-sm-6">
                  <q-input
                    color="white"
                    filled
                    v-model="createClient.legalRepresentativeFullname"
                    label="Nombre completo representante *"
                    lazy-rules
                    :rules="[
                      (val) => (val && val.length > 0) || 'Campo requerido',
                    ]"
                    maxlength="150"
                  />
                </div>

                <div class="col-sm-6">
                  <q-input
                    color="white"
                    filled
                    :model-value="createClient.legalRepresentativeRFC"
                    @update:model-value="
                      (value) => (createClient.legalRepresentativeRFC = (value as string)?.toUpperCase())
                    "
                    label="RFC representante *"
                    lazy-rules
                    :rules="[
                      (val) => (val && val.length > 0) || 'Campo requerido',
                      (val) => REGEX.RFC_PATTERN.test(val) || 'RFC mal formado',
                    ]"
                    maxlength="13"
                  />
                </div>

                <div class="col-sm-6">
                  <q-input
                    color="white"
                    filled
                    :model-value="createClient.legalRepresentativeCURP"
                    @update:model-value="
                      (value) => (createClient.legalRepresentativeCURP = (value as string)?.toUpperCase())
                    "
                    label="CURP representante"
                    lazy-rules
                    :rules="[
                      (val) =>
                        val.length === 0 ||
                        REGEX.CURP_PATTERN.test(val) ||
                        'CURP mal formado',
                    ]"
                    maxlength="18"
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
import {
  Client,
  ClientesApi,
  CreateClientDto,
  RegimenFiscalApi,
} from 'src/api-client'
import { ref, watch } from 'vue'
import { STATES, REGEX } from '../../constants'
import { AxiosError } from 'axios'
import { useRoute } from 'vue-router'

const $q = useQuasar()
const route = useRoute()
useMeta({
  title: 'Clientes::S&B',
})

const loading = ref(false)
const client = ref<Client | null>(null)

const clientForm = ref<QForm | null>(null)

const createClient = ref<Partial<CreateClientDto>>({
  name: '',
  paternalSurname: '',
  maternalSurname: '',
  email: '',
  phone: '',
  phone2: '',
  rfc: '',
  curp: '',
  street: '',
  outdoorNumber: '',
  interiorNumber: '',
  cologne: '',
  postalCode: '',
  province: '',
  state: '',
  legalRepresentativeFullname: '',
  legalRepresentativeRFC: '',
  legalRepresentativeCURP: '',
})

const activityItemBase: {
  activity: null | string
  percentage: null | string
  id?: number
} = { activity: null, percentage: null }
const regimesClient = ref<(string | null)[]>([null])
const activitiesClient = ref([{ ...activityItemBase }])

const regimesOptionsMapped = ref<
  { label: string; value: string; disable?: boolean }[]
>([])

// regimes
const getRegimes = async () => {
  const response = await new RegimenFiscalApi().regimeControllerFindAllRegimes()
  if (response.data.data?.regimes) {
    regimesOptionsMapped.value = response.data.data?.regimes.map(
      ({ id, name }) => ({
        label: name,
        value: `${id}`,
      })
    )
  }
}
getRegimes()

const addRegimeItem = () => regimesClient.value.push(null)

// activities
const addActivityItem = () =>
  activitiesClient.value.push({ ...activityItemBase })

const resetForm = () => {
  createClient.value.name = ''
  createClient.value.paternalSurname = ''
  createClient.value.maternalSurname = ''
  createClient.value.email = ''
  createClient.value.phone = ''
  createClient.value.phone2 = ''
  createClient.value.rfc = ''
  createClient.value.curp = ''
  createClient.value.street = ''
  createClient.value.outdoorNumber = ''
  createClient.value.interiorNumber = ''
  createClient.value.cologne = ''
  createClient.value.postalCode = ''
  createClient.value.province = ''
  createClient.value.state = ''
  createClient.value.legalRepresentativeFullname = ''
  createClient.value.legalRepresentativeRFC = ''
  createClient.value.legalRepresentativeCURP = ''

  regimesClient.value = [null]
  activitiesClient.value = [{ ...activityItemBase }]
}

const onSubmit = async () => {
  const totalPercentage = activitiesClient.value.reduce(
    (acc, item) => acc + +item.percentage!,
    0
  )

  if (totalPercentage !== 100) {
    $q.notify({
      color: 'negative',
      message: 'El total de porcentaje de las actividades deben de dar 100%',
    })
    return
  }

  const createClientRequest: CreateClientDto = {
    name: createClient.value.name as string,
    paternalSurname: createClient.value.paternalSurname,
    maternalSurname: createClient.value.maternalSurname,
    email: createClient.value.email as string,
    phone: createClient.value.phone,
    phone2: createClient.value.phone2,
    rfc: createClient.value.rfc as string,
    curp: createClient.value.curp,
    street: createClient.value.street,
    outdoorNumber: createClient.value.outdoorNumber,
    interiorNumber: createClient.value.interiorNumber,
    cologne: createClient.value.cologne,
    postalCode: createClient.value.postalCode,
    province: createClient.value.province,
    state: createClient.value.state as string,
    legalRepresentativeFullname: createClient.value
      .legalRepresentativeFullname as string,
    legalRepresentativeRFC: createClient.value.legalRepresentativeRFC as string,
    legalRepresentativeCURP: createClient.value
      .legalRepresentativeCURP as string,
    regimes: regimesClient.value.map((i) => +i!),
    activities: activitiesClient.value.map((i) => ({
      name: i.activity!,
      percentage: +i.percentage!,
      id: i.id,
    })),
  }

  try {
    Object.keys(createClientRequest).forEach((prop) => {
      if (createClientRequest[prop as keyof CreateClientDto] === '') {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        createClientRequest[prop as keyof CreateClientDto] = null
      }
    })

    const response = await new ClientesApi().clientsControllerUpdateClient(
      client.value?.id as number,
      {
        ...createClientRequest,
      }
    )
    $q.notify({
      color: 'positive',
      message: 'El Cliente fue guardado con exito',
    })

    resetForm()
    clientForm.value!.reset()
    clientForm.value!.resetValidation()
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
const getClient = async () => {
  loading.value = true
  const response = await new ClientesApi().clientsControllerFindOneClient(
    +route.params.clientId
  )
  client.value = response.data.data?.client as Client
  loading.value = false

  createClient.value.name = client.value.name
  createClient.value.paternalSurname = client.value.paternalSurname
  createClient.value.maternalSurname = client.value.maternalSurname
  createClient.value.email = client.value.email
  createClient.value.phone = client.value.phone
  createClient.value.phone2 = client.value.phone2
  createClient.value.rfc = client.value.rfc
  createClient.value.curp = client.value.curp
  createClient.value.street = client.value.street
  createClient.value.outdoorNumber = client.value.outdoorNumber
  createClient.value.interiorNumber = client.value.interiorNumber
  createClient.value.cologne = client.value.cologne
  createClient.value.postalCode = client.value.postalCode
  createClient.value.province = client.value.province
  createClient.value.state = client.value.state
  createClient.value.legalRepresentativeFullname =
    client.value.legalRepresentativeFullname
  createClient.value.legalRepresentativeRFC =
    client.value.legalRepresentativeRFC
  createClient.value.legalRepresentativeCURP =
    client.value.legalRepresentativeCURP

  if (client.value.regimes) {
    regimesClient.value = client.value.regimes?.map((i) => `${i.id}`)
  }

  if (client.value.activities) {
    activitiesClient.value = client.value.activities.map((item) => ({
      activity: item.name,
      percentage: `${item.percentage}`,
      id: item.id,
    }))
  }
}

getClient()

watch(
  () => regimesClient.value,
  (to) => {
    regimesOptionsMapped.value.forEach((item) => {
      if (to.map((i) => +i!).includes(+item.value)) item.disable = true
      else delete item.disable
    })
  },
  { deep: true }
)

watch(
  () => route.params,
  (to) => {
    if (to?.clientId) getClient()
  }
)
</script>
