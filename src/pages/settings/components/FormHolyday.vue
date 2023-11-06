<script setup lang="ts">
import { AxiosError } from 'axios'
import { QForm, useQuasar } from 'quasar'
import { Configuration, Holyday, HolydaysApi } from 'src/api-client'
import { useAuthStore } from 'src/stores/auth-store'
import { nextTick, reactive, ref } from 'vue'

const $q = useQuasar()
const authStore = useAuthStore()
const configToken = new Configuration({ accessToken: authStore.token })

const props = defineProps<{
  mode: 'create' | 'update'
  day?: Holyday | undefined
}>()

const emit = defineEmits<{
  (e: 'onSave'): void
}>()

const loadingCreate = ref(false)
const formHolyday = reactive({
  name: props.day?.name || '',
  date: props.day?.date || '',
})
const formHtmlHolyday = ref<QForm | null>(null)

const onReset = async () => {
  formHolyday.name = ''
  formHolyday.date = ''
  await nextTick()

  if (formHtmlHolyday.value) {
    formHtmlHolyday.value.resetValidation()
  }
}

const onSubmit = async () => {
  loadingCreate.value = true
  try {
    const api = new HolydaysApi(configToken)

    let response = null
    if (props.mode === 'create') {
      response = await api.holydaysControllerCreateHolyday({
        name: formHolyday.name,
        date: formHolyday.date,
      })
    } else if (props.mode === 'update' && props.day) {
      response = await api.holydaysControllerUpdate(props.day.id as number, {
        name: formHolyday.name,
        date: formHolyday.date,
      })
    }

    if (response?.data) {
      loadingCreate.value = false

      $q.notify({
        color: 'positive',
        message: 'día agregado correctamente',
      })
      emit('onSave')

      onReset()
    }
  } catch (e) {
    loadingCreate.value = false
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
</script>
<template>
  <q-form @submit="onSubmit" greedy @reset="onReset" ref="formHtmlHolyday">
    <div class="row q-col-gutter-y-sm">
      <div class="col-12">
        <q-input
          color="white"
          filled
          v-model="formHolyday.name"
          label="nombre del día"
          :rules="[(val) => !!val.length || 'Campo requerido']"
        >
        </q-input>
      </div>
      <div class="col-12">
        <q-input
          color="white"
          filled
          label="Fecha (YYYY-MM-DD)"
          v-model="formHolyday.date"
          :rules="[(val) => !!val.length || 'Campo requerido']"
          mask="####-##-##"
        >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy
                cover
                transition-show="scale"
                transition-hide="scale"
              >
                <q-date v-model="formHolyday.date" mask="YYYY-MM-DD">
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Close" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>
      <div class="col-12">
        <q-btn
          color="primary"
          :label="props.mode === 'create' ? 'agregar' : 'guardar cambios'"
          icon="save"
          type="submit"
          :loading="loadingCreate"
        />
      </div>
    </div>
  </q-form>
</template>
