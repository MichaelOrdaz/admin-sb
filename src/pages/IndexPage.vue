<script setup lang="ts">
import { QTableProps, useMeta, useQuasar } from 'quasar'
import dayjs from 'dayjs'
import LocalizedFormat from 'dayjs/plugin/localizedFormat'
import 'dayjs/locale/es'
import { useAuthStore } from 'src/stores/auth-store'
import {
  ClientDeadlineDto,
  ClientesApi,
  Configuration,
  Holyday,
} from 'src/api-client'
import { ref } from 'vue'
import { AxiosError } from 'axios'
import { ROUTER_NAMES } from 'src/router'
dayjs.extend(LocalizedFormat)
dayjs.locale('es')

const $q = useQuasar()
const authStore = useAuthStore()
const configToken = new Configuration({ accessToken: authStore.token })

useMeta({
  title: 'Inicio::S&B',
})

const columns: QTableProps['columns'] = [
  {
    name: 'name',
    label: 'Cliente',
    field: 'name',
    align: 'left',
    required: true,
    sortable: true,
  },
  {
    name: 'rfc',
    align: 'left',
    label: 'rfc',
    field: 'rfc',
    sortable: true,
  },
  {
    name: 'typePerson',
    align: 'left',
    label: 'Tipo de persona',
    field: 'typePerson',
    sortable: true,
  },
  {
    name: '6to',
    align: 'left',
    label: '6to',
    field: 'digit6',
    sortable: true,
  },
  {
    name: 'aditionalDayClient',
    align: 'left',
    label: 'extra',
    field: 'aditionalDayClient',
    sortable: true,
  },
  {
    name: 'deadline',
    label: 'Fecha limite',
    field: 'deadline',
    format(val: string) {
      return val ? dayjs(val).format('LL') : ''
    },
    sort: (a, b) => {
      return dayjs(a).isBefore(dayjs(b))
        ? -1
        : dayjs(a).isAfter(dayjs(b))
        ? 1
        : 0
    },
    align: 'left',
    sortable: true,
    sortOrder: 'da',
  },
  {
    name: 'diff',
    label: 'faltan',
    field: 'diff',
    format: (val) => (val ? `${val}d` : '-'),
    sortable: true,
  },
  { name: 'actions', label: 'acciones', field: 'acciones' },
]

const clientsDeadlines = ref<ClientDeadlineDto[]>([])
const loading = ref(false)

const holydays = ref<Holyday[]>([])

const getClients = async () => {
  loading.value = true
  try {
    const response = await new ClientesApi(
      configToken
    ).clientsControllerDueDateClients()
    if (response.data.data) {
      const currentDate = dayjs().startOf('d')
      const result = (response.data.data.clients as ClientDeadlineDto[]).map(
        (item) => {
          const diff = dayjs(item.deadline).diff(currentDate, 'days')
          return {
            ...item,
            diff: diff > 0 ? diff : null,
          }
        }
      )
      clientsDeadlines.value = result as ClientDeadlineDto[]

      holydays.value = response.data.data.holydays as Holyday[]
    }
    loading.value = false
  } catch (e) {
    loading.value = false
    if (e instanceof AxiosError) {
      $q.notify({
        color: 'negative',
        message: e.response?.data.message,
      })
    } else if (e instanceof Error) {
      $q.notify({
        color: 'negative',
        message:
          'Upps, hubo un problema al realizar la acción, por favor reintenta',
      })
    }
  }
}

getClients()

const filter = ref('')
</script>

<template>
  <q-page class="q-pa-md">
    <div class="row">
      <div class="col-md-9 col-xs-12">
        <q-card flat>
          <q-card-section>
            <div class="text-h6">Fecha limite de pago de impuestos</div>
          </q-card-section>

          <q-card-section>
            Este mes de {{ dayjs().format('MMMM') }}
            <template v-if="holydays.length === 0">
              no hay días festivos
            </template>
            <template v-else>
              hay {{ holydays.length }} días feriados
              <br />
              <ul>
                <li v-for="holyday in holydays" :key="holyday.id">
                  {{ holyday.name }} - {{ holyday.date }}
                </li>
              </ul>
            </template>
          </q-card-section>

          <q-table
            row-key="id"
            :rows="clientsDeadlines"
            :columns="columns"
            :loading="loading"
            :pagination="{
              rowsPerPage: 0,
              sortBy: 'deadline',
              descending: false,
            }"
            wrap-cells
            style="max-height: 600px"
            virtual-scroll
            :rows-per-page-options="[0]"
            :filter="filter"
          >
            <template v-slot:top>
              <q-space />
              <q-input
                filled
                debounce="300"
                color="white"
                label="buscar"
                v-model="filter"
              >
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </template>
            <template v-slot:body-cell-actions="props">
              <q-td :props="props">
                <q-btn
                  flat
                  round
                  icon="zoom_in"
                  :to="{
                    name: ROUTER_NAMES.CLIENTS_DETAILS,
                    params: { clientId: props.row.id },
                    query: { active: 1 },
                  }"
                  title="detalles de cliente"
                />
              </q-td>
            </template>
            <template v-slot:body-cell="props">
              <q-td
                :props="props"
                :class="{
                  'bg-negative': props.row.diff && props.row.diff <= 3,
                }"
              >
                {{ props.value }}
              </q-td>
            </template>
            <template v-slot:loading>
              <q-inner-loading showing color="primary" />
            </template>
          </q-table>
        </q-card>
      </div>
    </div>
  </q-page>
</template>
