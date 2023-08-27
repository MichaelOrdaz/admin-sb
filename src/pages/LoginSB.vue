<script lang="ts" setup>
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth-store'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ROUTER_NAMES } from 'src/router/index'

const authStore = useAuthStore()
const router = useRouter()

const $q = useQuasar()

const email = ref('')
const password = ref('')

const onSubmit = async () => {
  try {
    await authStore.login(email.value, password.value)
    $q.notify({
      color: 'green-4',
      textColor: 'white',
      message: 'Acceso correcto',
    })
    router.push({ name: ROUTER_NAMES.HOME })
  } catch (e) {
    if (e instanceof Error) {
      $q.notify({
        color: 'negative',
        textColor: 'white',
        message: e.message,
      })
    }
  }
}

// const perfil = async () => {
//   const me = await new AuthApi().authControllerGetProfile({
//     headers: {
//       Authorization: `Bearer ${authStore.token}`,
//     },
//   })
// }
</script>
<template>
  <div class="row justify-center window-height items-center q-pa-sm">
    <q-card class="col-xs-12 col-sm-6 col-md-4 login q-pa-lg">
      <q-img
        src="~assets/sb-logo.jpg"
        width="120px"
        style="display: block; margin: auto; position: relative"
      />
      <h5 class="text-center text-uppercase">Inicio de sesion</h5>
      <q-form @submit="onSubmit">
        <q-input
          filled
          v-model="email"
          label="Correo electrónico *"
          lazy-rules
          :rules="[(val) => (val && val.length > 0) || 'Campo requerido']"
        />

        <q-input
          filled
          type="password"
          v-model="password"
          label="Contraseña *"
          lazy-rules
          :rules="[(val) => (val !== null && val !== '') || 'Campo requerido']"
        />

        <div>
          <q-btn
            label="Entrar"
            type="submit"
            color="primary"
            style="width: 100%"
            size="lg"
          />
        </div>
      </q-form>
    </q-card>
  </div>
</template>
<style scoped lang="sass">
.login
  background-color: $sb-secondary
</style>
