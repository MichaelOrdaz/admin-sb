<template>
  <q-page class="q-pa-md">
    <div class="row">
      <div class="col-xs-12">
        <q-card flat>
          <q-card-section>
            <div class="text-h6">Resumen de accesos de los clientes</div>
          </q-card-section>

          <q-table
            row-key="id"
            :rows="accessCodes"
            :columns="columns"
            :loading="loading"
            :filter="filter"
            :pagination="{
              rowsPerPage: 10,
            }"
          >
            <template v-slot:body-cell-code="props">
              <q-td :props="props">
                <text-toggle-password :text="props.value" />
              </q-td>
            </template>
            <template v-slot:body-cell-actions="props">
              <q-td :props="props">
                <q-btn
                  flat
                  round
                  icon="edit"
                  :to="{
                    name: ROUTER_NAMES.USERS_DETAILS,
                    params: { userId: props.row.id },
                  }"
                  title="editar"
                  disable
                />
              </q-td>
            </template>
            <template v-slot:loading>
              <q-inner-loading showing color="primary" />
            </template>

            <template v-slot:top>
              <q-select
                v-model="accessCodeType"
                label="Tipo de clave de aceso"
                :options="codeNamesOptions"
                filled
                emit-value
                map-options
                style="min-width: 300px"
                color="white"
              />

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
          </q-table>
        </q-card>
      </div>
    </div>

    <q-dialog v-model="confirm" persistent>
      <q-card>
        <q-card-section class="items-start" v-if="selected">
          <q-avatar
            :icon="messageDialog.icon"
            :color="messageDialog.colorIcon"
            text-color="white"
          />
          <div class="q-ml-sm" v-if="selected">
            {{ messageDialog.message }}
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            :label="messageDialog.labelBtnConfirm"
            :color="messageDialog.colorIcon"
            v-close-popup
          />
          <q-btn flat label="cancelar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { QTableProps, useMeta, useQuasar } from 'quasar'
import { reactive, ref, watchEffect } from 'vue'
import { AxiosError } from 'axios'
import { useAuthStore } from 'src/stores/auth-store'
import { AccessCode, AccessCodesApi, Configuration } from 'src/api-client'
import { ROUTER_NAMES } from 'src/router'
import TextTogglePassword from 'src/components/TextTogglePassword.vue'

import dayjs from 'dayjs'
import LocalizedFormat from 'dayjs/plugin/localizedFormat'
import 'dayjs/locale/es'
dayjs.extend(LocalizedFormat)
dayjs.locale('es')

const $q = useQuasar()
const authStore = useAuthStore()
const configToken = new Configuration({ accessToken: authStore.token })

useMeta({
  title: 'Códigos de acceso::S&B',
})

const confirm = ref(false)
const selected = ref<AccessCode | null>(null)

const codeNamesOptions = ref<{ label: string; value: string }[]>([])

const messageDialog = reactive({
  action: '',
  message: '',
  icon: '',
  colorIcon: '',
  labelBtnConfirm: '',
})

const loading = ref(false)
const filter = ref('')
const accessCodes = ref<AccessCode[]>([])
const accessCodeType = ref<string | null>(null)

const getAccessCodesNames = async () => {
  loading.value = true
  try {
    const response = await new AccessCodesApi(
      configToken
    ).accessCodesControllerFindCodeNames()
    if (response.data.data) {
      const result = response.data.data.map((item) => ({
        label: `${item.humanizedName}`,
        value: `${item.name}`,
      }))
      codeNamesOptions.value = result.sort((a, b) =>
        a.label.localeCompare(b.label)
      )
    }
    accessCodeType.value = codeNamesOptions.value[0].value

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

getAccessCodesNames()

const getAccessCodes = async () => {
  loading.value = true
  try {
    const response = await new AccessCodesApi(
      configToken
    ).accessCodesControllerFindAllCodes(
      undefined,
      undefined,
      accessCodeType.value as any
    )
    accessCodes.value = response.data.data as AccessCode[]
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

watchEffect(() => {
  if (accessCodeType.value) {
    getAccessCodes()
  }
})

const columns: QTableProps['columns'] = [
  {
    name: 'name',
    label: 'Cliente',
    field: (row: AccessCode) =>
      `${row.client?.name} ${row.client?.paternalSurname || ''} ${
        row.client?.maternalSurname || ''
      }`,
    align: 'left',
    required: true,
    sortable: true,
  },
  {
    name: 'rfc',
    align: 'left',
    label: 'rfc',
    field: (row: AccessCode) => `${row.client?.rfc}`,
    sortable: true,
  },
  {
    name: 'code',
    align: 'left',
    label: 'Clave',
    field: 'code',
  },
  {
    name: 'username',
    align: 'left',
    label: 'Usuario',
    field: 'username',
  },
  {
    name: 'email',
    align: 'left',
    label: 'email',
    field: 'email',
    sortable: true,
  },
  {
    name: 'expeditionDate',
    label: 'Fecha de emisión',
    field: 'expeditionDate',
    format(val) {
      return val ? dayjs(val).format('LL') : ''
    },
    align: 'left',
  },
  {
    name: 'dueDate',
    label: 'Fecha de expiración',
    field: 'dueDate',
    format(val) {
      return val ? dayjs(val).format('LL') : ''
    },
    align: 'left',
  },
  { name: 'actions', label: 'acciones', field: 'acciones' },
]

const showDialogActionInactive = (row: AccessCode) => {
  confirm.value = true
  selected.value = row
  messageDialog.action = 'inactive'
  messageDialog.message = '¿Deseas desactivar al usuario'
  messageDialog.icon = 'remove_circle'
  messageDialog.colorIcon = 'warning'
  messageDialog.labelBtnConfirm = 'Desactivar'
}
</script>
