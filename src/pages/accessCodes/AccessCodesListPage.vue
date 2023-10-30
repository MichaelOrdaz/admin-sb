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
            :visible-columns="visibleColumns"
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
                  title="editar"
                  @click="() => handleSelectItem(props.row)"
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
      <q-card v-if="selected">
        <q-card-section>
          <div class="text-h6">
            Editar accesos del cliente
            {{
              `${selected.client?.name} ${selected.client?.paternalSurname} ${selected.client?.maternalSurname}`
            }}
          </div>
        </q-card-section>
        <q-card-section>
          <q-form @submit="onSubmit" id="editaccesscode">
            <div class="row q-col-gutter-md">
              <div
                class="col-12"
                v-show="
                  [
                    'CIEC',
                    'CERTIFICADO IMSS',
                    'ESCRITORIO VIRTUAL IMSS',
                    'SIPARE',
                    'INFONAVIT',
                    'ISN',
                  ].includes(`${selected.name}`)
                "
              >
                <q-input
                  filled
                  label="Nombre de usuario"
                  v-model="editAccessCode.username"
                  color="white"
                >
                </q-input>
              </div>
              <div
                class="col-12"
                v-show="['INFONAVIT'].includes(`${selected.name}`)"
              >
                <q-input
                  filled
                  label="correo electrónico"
                  v-model="editAccessCode.email"
                  color="white"
                >
                </q-input>
              </div>
              <div class="col-12">
                <q-input
                  filled
                  label="contraseña"
                  v-model="editAccessCode.code"
                  :type="editAccessCode.isPwd ? 'password' : 'text'"
                  color="white"
                >
                  <template v-slot:append>
                    <q-icon
                      :name="
                        editAccessCode.isPwd ? 'visibility_off' : 'visibility'
                      "
                      class="cursor-pointer"
                      @click="editAccessCode.isPwd = !editAccessCode.isPwd"
                    />
                  </template>
                </q-input>
              </div>

              <div
                class="col-12"
                v-show="
                  ['E.FIRMA', 'E.FIRMA REP LEGAL', 'CSD'].includes(
                    `${selected.name}`
                  )
                "
              >
                <q-input
                  filled
                  label="Fecha de emisión"
                  v-model="editAccessCode.expeditionDate"
                  color="white"
                  type="date"
                >
                </q-input>
              </div>
              <div
                class="col-12"
                v-show="
                  ['E.FIRMA', 'E.FIRMA REP LEGAL', 'CSD'].includes(
                    `${selected.name}`
                  )
                "
              >
                <q-input
                  filled
                  label="Fecha de expiración"
                  v-model="editAccessCode.dueDate"
                  color="white"
                  type="date"
                >
                </q-input>
              </div>
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            label="Guardar cambios"
            color="primary"
            type="submit"
            form="editaccesscode"
          />
          <q-btn label="cancelar" color="grey" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { QTableProps, useMeta, useQuasar } from 'quasar'
import { computed, reactive, ref, watchEffect } from 'vue'
import { AxiosError } from 'axios'
import { useAuthStore } from 'src/stores/auth-store'
import {
  AccessCode,
  AccessCodesApi,
  CodigosDeClienteApi,
  Configuration,
} from 'src/api-client'
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

const visibleColumns = computed(() => {
  const visibles = ['name', 'rfc', 'code', 'actions']
  if (
    [
      'CIEC',
      'CERTIFICADO IMSS',
      'ESCRITORIO VIRTUAL IMSS',
      'SIPARE',
      'INFONAVIT',
      'ISN',
    ].includes(`${accessCodeType.value}`)
  ) {
    visibles.push('username')
  } else if (
    ['E.FIRMA', 'E.FIRMA REP LEGAL', 'CSD'].includes(`${accessCodeType.value}`)
  ) {
    visibles.push('expeditionDate', 'dueDate')
  }

  if (['INFONAVIT'].includes(`${accessCodeType.value}`)) {
    visibles.push('email')
  }

  return visibles
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

const initialFormAccessCode = {
  username: '',
  code: '',
  email: '',
  expeditionDate: '',
  dueDate: '',
  isPwd: true,
}
const editAccessCode = reactive({ ...initialFormAccessCode })

const handleSelectItem = (row: AccessCode) => {
  confirm.value = true
  selected.value = row

  editAccessCode.code = row.code
  editAccessCode.username = row.username ? row.username : ''
  editAccessCode.email = row.email ? row.email : ''
  editAccessCode.expeditionDate = row.expeditionDate
    ? dayjs(row.expeditionDate).format('YYYY-MM-DD')
    : ''
  editAccessCode.dueDate = row.dueDate
    ? dayjs(row.dueDate).format('YYYY-MM-DD')
    : ''
}

const onSubmit = async () => {
  if (!selected.value) return

  if (
    [
      'CIEC',
      'CERTIFICADO IMSS',
      'ESCRITORIO VIRTUAL IMSS',
      'SIPARE',
      'ISN',
    ].includes(`${selected.value?.name}`)
  ) {
    if (!editAccessCode.code || !editAccessCode.username) {
      $q.notify({
        color: 'negative',
        message:
          'Todos los campos son requeridos (contraseña y nombre de usuario)',
      })
      return
    }
  } else if (
    ['E.FIRMA', 'E.FIRMA REP LEGAL', 'CSD'].includes(`${selected.value?.name}`)
  ) {
    if (
      !editAccessCode.code ||
      !editAccessCode.expeditionDate ||
      !editAccessCode.dueDate
    ) {
      $q.notify({
        color: 'negative',
        message:
          'Todos los campos son requeridos (contraseña, fecha de emisión y fecha de expiración)',
      })
      return
    }
  } else if (['INFONAVIT'].includes(`${selected.value?.name}`)) {
    if (
      !editAccessCode.code ||
      !editAccessCode.username ||
      !editAccessCode.email
    ) {
      $q.notify({
        color: 'negative',
        message:
          'Todos los campos son requeridos (contraseña, nombre de usuario y correo electrónico)',
      })
      return
    }
  }

  try {
    const response = await new AccessCodesApi(
      configToken
    ).accessCodesControllerUpdateCode(selected.value?.id as number, {
      code: editAccessCode.code,
      user: editAccessCode.username || null,
      email: editAccessCode.email || null,
      expeditionDate: editAccessCode.expeditionDate
        ? dayjs(editAccessCode.expeditionDate).toDate().toISOString()
        : null,
      dueDate: editAccessCode.dueDate
        ? dayjs(editAccessCode.dueDate).toDate().toISOString()
        : null,
    })

    $q.notify({
      color: 'positive',
      message: 'Los cambios se guardaron correctamente',
    })
    getAccessCodes()
    confirm.value = false
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
</script>
