<script setup lang="ts">
import { QTableProps, useMeta, useQuasar } from 'quasar'
import dayjs from 'dayjs'
import LocalizedFormat from 'dayjs/plugin/localizedFormat'
import 'dayjs/locale/es'
import { useAuthStore } from 'src/stores/auth-store'
import { Configuration, Holyday, HolydaysApi } from 'src/api-client'
import { AxiosError } from 'axios'
import { ref } from 'vue'
import FormHolyday from './components/FormHolyday.vue'
dayjs.extend(LocalizedFormat)
dayjs.locale('es')

const $q = useQuasar()
const authStore = useAuthStore()
const configToken = new Configuration({ accessToken: authStore.token })

useMeta({
  title: 'Días inhabiles::S&B',
})

const currentYear = ref(new Date().getFullYear())

const columns: QTableProps['columns'] = [
  {
    name: 'name',
    label: 'Nombre',
    field: 'name',
    align: 'left',
    required: true,
    sortable: true,
  },
  {
    name: 'date',
    label: 'Fecha',
    field: 'date',
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
  { name: 'actions', label: 'acciones', field: 'acciones' },
]

const loading = ref(false)

const holydays = ref<Holyday[]>([])

const getHolydays = async () => {
  loading.value = true
  try {
    const response = await new HolydaysApi(
      configToken
    ).holydaysControllerFindAllHolydaysByYear(currentYear.value)
    if (response.data.data?.days) {
      holydays.value = response.data.data.days
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

getHolydays()

let debounceTimer: NodeJS.Timeout | null = null

const debounceRequest = () => {
  console.log('se ejecuto el efecto')
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  debounceTimer = setTimeout(() => {
    getHolydays()
  }, 500)
}

const selectedDay = ref<Holyday | null>(null)

const confirmDelete = ref(false)

const onDeleteHolyday = async () => {
  if (selectedDay.value === null) {
    return
  }

  try {
    const response = await new HolydaysApi(
      configToken
    ).holydaysControllerRemove(selectedDay.value.id as number)
    if (response.data.data) {
      selectedDay.value = null

      $q.notify({
        color: 'positive',
        message: 'El dia fue eliminando',
      })
      getHolydays()
    }
  } catch (e) {
    loading.value = false
    if (e instanceof AxiosError && e.response?.data) {
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

const showEditDialg = ref(false)
</script>

<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-x-md">
      <div class="col-md-8 col-xs-12">
        <q-card flat>
          <q-card-section>
            <div class="text-h6">
              Días inhábiles
              <q-btn
                icon="remove"
                round
                color="secondary"
                size="xs"
                @click="currentYear--, debounceRequest()"
              />
              {{ currentYear }}
              <q-btn
                icon="add"
                round
                color="secondary"
                size="xs"
                @click="currentYear++, debounceRequest()"
              />
            </div>
          </q-card-section>

          <q-table
            row-key="id"
            :rows="holydays"
            :columns="columns"
            :loading="loading"
            :pagination="{
              rowsPerPage: 0,
              sortBy: 'deadline',
              descending: false,
            }"
            wrap-cells
            :rows-per-page-options="[0]"
          >
            <template v-slot:body-cell-actions="props">
              <q-td :props="props">
                <q-btn
                  flat
                  round
                  icon="edit"
                  title="Editar"
                  @click=";(showEditDialg = true), (selectedDay = props.row)"
                />
                <q-btn
                  flat
                  round
                  icon="delete"
                  title="Eliminar"
                  @click=";(confirmDelete = true), (selectedDay = props.row)"
                />
              </q-td>
            </template>
            <template v-slot:loading>
              <q-inner-loading showing color="primary" />
            </template>
          </q-table>
        </q-card>
      </div>
      <div class="col">
        <q-card flat>
          <q-card-section>
            <div class="text-h6">Agregar día inhábil</div>
          </q-card-section>
          <q-card-section>
            <form-holyday @on-save="getHolydays()" mode="create"></form-holyday>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-dialog v-model="confirmDelete" persistent>
      <q-card v-if="selectedDay && confirmDelete">
        <q-card-section class="items-start">
          <q-avatar icon="delete" color="warning" text-color="black" />
          <div class="q-ml-sm">
            ¿Deseas eliminar el día <b>{{ selectedDay.name }}</b> ({{
              selectedDay.date
            }}) de la lista de días inhábiles?
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            label="Si, eliminar"
            color="warning"
            v-close-popup
            @click="onDeleteHolyday"
          />
          <q-btn flat label="cancelar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showEditDialg" persistent>
      <q-card v-if="selectedDay && showEditDialg">
        <q-card-section>
          <div class="text-h6">
            <q-avatar icon="edit" color="primary" /> Editar fecha
          </div>
        </q-card-section>
        <q-card-section>
          <form-holyday
            @on-save="getHolydays(), (showEditDialg = false)"
            mode="update"
            :day="selectedDay"
          ></form-holyday>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="cancelar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>
