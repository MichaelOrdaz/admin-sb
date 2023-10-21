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
const isPwd = ref(true)

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
</script>
<template>
  <div class="row justify-center window-height items-center q-pa-sm">
    <q-card class="col-xs-12 col-sm-6 col-md-4 login q-pa-lg">
      <q-img
        src="~assets/sb-logo.png"
        width="100px"
        style="display: block; margin: auto"
      />
      <h5 class="text-center text-uppercase">Inicio de sesión</h5>
      <q-form @submit="onSubmit" class="row q-col-gutter-y-sm">
        <q-input
          class="col-12"
          filled
          v-model="email"
          label="Correo electrónico *"
          lazy-rules
          :rules="[
            (val) => (val && val.length > 0) || 'Campo requerido',
            'email',
          ]"
        />

        <q-input
          class="col-12"
          filled
          :type="isPwd ? 'password' : 'text'"
          v-model="password"
          label="Contraseña *"
          lazy-rules
          :rules="[(val) => (val !== null && val !== '') || 'Campo requerido']"
        >
          <template v-slot:append>
            <q-icon
              :name="isPwd ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="isPwd = !isPwd"
            />
          </template>
        </q-input>

        <div class="col-12">
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
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" id="wave">
    <path
      fill="#04293A"
      fill-opacity="1"
      d="M0,128L60,138.7C120,149,240,171,360,165.3C480,160,600,128,720,106.7C840,85,960,75,1080,74.7C1200,75,1320,85,1380,90.7L1440,96L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
    ></path>
  </svg>
</template>
<style scoped lang="sass">
.login
  background-color: $sb-secondary
  z-index: 1
#wave
  position: absolute
  bottom:  0
  left: 0
  right: 0
</style>
<style lang="sass">
body
  background: $sb-dark !important
</style>
