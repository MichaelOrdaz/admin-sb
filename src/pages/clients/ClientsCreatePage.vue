<template>
  <q-page class="q-pa-md">
    <div class="row">
      <div class="col-xs-12">
        <q-card>
          <q-card-section>
            <q-btn
              color="white"
              :to="{ name: ROUTER_NAMES.CLIENTS_LIST }"
              icon="arrow_back"
              flat
            >
            </q-btn>
          </q-card-section>
          <q-card-section style="font-size: 20px; font-weight: bold">
            Nuevo cliente
          </q-card-section>

          <q-card-section>
            <q-form @submit="onSubmit" greedy>
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
                  />
                </div>

                <div class="col-sm-6">
                  <q-input
                    color="white"
                    filled
                    v-model="createClient.maternalSurname"
                    label="Apellido Materno"
                  />
                </div>

                <div class="col-sm-6">
                  <q-input
                    color="white"
                    filled
                    v-model="createClient.rfc"
                    label="RFC"
                    lazy-rules
                    :rules="[
                      (val) => (val && val.length > 0) || 'Campo requerido',
                    ]"
                  />
                </div>

                <div class="col-sm-6">
                  <q-input
                    color="white"
                    filled
                    v-model="createClient.curp"
                    label="CURP"
                    lazy-rules
                    :rules="[
                      (val) => (val && val.length > 0) || 'Campo requerido',
                    ]"
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
                    ]"
                  />
                </div>

                <div class="col-sm-6">
                  <q-input
                    color="white"
                    filled
                    v-model="createClient.phone"
                    label="Teléfono"
                  />
                </div>

                <div class="col-sm-6">
                  <q-input
                    color="white"
                    filled
                    v-model="createClient.phone2"
                    label="Teléfono alternativo"
                  />
                </div>
              </div>

              <div class="row q-my-md">
                <div class="col text-weight-bold">Regimen fiscal</div>
              </div>

              <div class="row q-col-gutter-sm items-baseline">
                <template
                  v-for="(regimeClient, index) in regimesClient"
                  :key="index"
                >
                  <div class="col-xs-10">
                    <q-select
                      color="white"
                      filled
                      label="Regimen fiscal"
                      :options="regimesOptionsMapped"
                      @update:model-value="
                        (value) => updateRegimeClient(value, index)
                      "
                      :model-value="regimeClient"
                      :rules="[(val) => val || 'Debes seleccionar un regimen']"
                    />
                  </div>
                  <div class="col-auto" v-show="regimesClient.length > 1">
                    <q-btn
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
                  />
                </div>

                <div class="col-sm-6">
                  <q-input
                    color="white"
                    filled
                    v-model="createClient.interiorNumber"
                    label="Número interior"
                  />
                </div>

                <div class="col-sm-6">
                  <q-input
                    color="white"
                    filled
                    v-model="createClient.outdoorNumber"
                    label="Número exterior"
                  />
                </div>

                <div class="col-sm-6">
                  <q-input
                    color="white"
                    filled
                    v-model="createClient.cologne"
                    label="Colonia *"
                    lazy-rules
                    :rules="[
                      (val) => (val && val.length > 0) || 'Campo requerido',
                    ]"
                  />
                </div>

                <div class="col-sm-6">
                  <q-input
                    color="white"
                    filled
                    v-model="createClient.postalCode"
                    label="Código Postal *"
                    lazy-rules
                    :rules="[
                      (val) => (val && val.length > 0) || 'Campo requerido',
                    ]"
                  />
                </div>

                <div class="col-sm-6">
                  <q-input
                    color="white"
                    filled
                    v-model="createClient.province"
                    label="Ciudad"
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
                    label="Nombre completo representante"
                    lazy-rules
                    :rules="[
                      (val) => (val && val.length > 0) || 'Campo requerido',
                    ]"
                  />
                </div>

                <div class="col-sm-6">
                  <q-input
                    color="white"
                    filled
                    v-model="createClient.legalRepresentativeRFC"
                    label="RFC representante"
                    lazy-rules
                    :rules="[
                      (val) => (val && val.length > 0) || 'Campo requerido',
                    ]"
                  />
                </div>

                <div class="col-sm-6">
                  <q-input
                    color="white"
                    filled
                    v-model="createClient.legalRepresentativeCURP"
                    label="CURP representante"
                    lazy-rules
                    :rules="[
                      (val) => (val && val.length > 0) || 'Campo requerido',
                    ]"
                  />
                </div>
              </div>

              <div class="row">
                <div class="col-12">
                  <q-btn
                    icon="save"
                    label="Guardar cliente"
                    type="submit"
                    color="primary"
                  />
                </div>
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useMeta } from 'quasar'
import {
  Client,
  ClientActivitiesDto,
  ClientesApi,
  CreateClientDto,
  Regime,
  RegimenFiscalApi,
} from 'src/api-client'
import { ROUTER_NAMES } from 'src/router'
import { useAuthStore } from 'src/stores/auth-store'
import { ref } from 'vue'
import { STATES } from '../../constants'

const authStore = useAuthStore()
const token = { headers: { Authorization: `Bearer ${authStore.token}` } }

useMeta({
  title: 'Clientes::S&B',
})

interface CreateClientDtoExtendido extends CreateClientDto {
  legalRepresentativeFullname: string
  legalRepresentativeRFC: string
  legalRepresentativeCURP: string
}

const createClient = ref<Partial<CreateClientDtoExtendido>>({
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

const activityItemBase = { activity: null, percentage: null }
const regimesClient = ref<any[]>([null])
const activitiesClient = ref([{ ...activityItemBase }])

const regimesOptionsMapped = ref<
  { label: string; value: string; disable?: boolean }[]
>([])

// regimes
const getRegimes = async () => {
  const response = await new RegimenFiscalApi().regimeControllerFindAllRegimes(
    token
  )
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

const updateRegimeClient = (value: any, index: number) => {
  const result = regimesOptionsMapped.value.find((i) => i.value === value.value)
  if (result) result.disable = true

  regimesClient.value[index] = value
}

const addRegimeItem = () => regimesClient.value.push(null)

// activities
const addActivityItem = () =>
  activitiesClient.value.push({ ...activityItemBase })

const onSubmit = async () => {
  const createClientRequest: CreateClientDto = {
    name: createClient.value.name || '',
    paternalSurname: createClient.value.paternalSurname || '',
    maternalSurname: createClient.value.maternalSurname || '',
    email: createClient.value.email || '',
    phone: createClient.value.phone || '',
    phone2: createClient.value.phone2 || '',
    rfc: createClient.value.rfc || '',
    curp: createClient.value.curp || '',
    street: createClient.value.street || '',
    outdoorNumber: createClient.value.outdoorNumber || '',
    interiorNumber: createClient.value.interiorNumber || '',
    cologne: createClient.value.cologne || '',
    postalCode: createClient.value.postalCode || '',
    province: createClient.value.province || '',
    state: createClient.value.state || '',
    regimes: regimesClient.value.map((i) => +i.value as number),
    activities: activitiesClient.value.map((i) => ({
      name: i.activity!,
      percentage: +i.percentage!,
    })),
  }

  const response = await new ClientesApi().clientsControllerCreateClient(
    {
      ...createClientRequest,
    },
    {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    }
  )
}
</script>
