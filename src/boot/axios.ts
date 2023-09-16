import { boot } from 'quasar/wrappers'
import axios, { AxiosError, AxiosInstance } from 'axios'
import { LocalStorage, Notify } from 'quasar'
import { AUTH_TOKEN } from 'src/stores/auth-store'
import { ROUTER_NAMES } from 'src/router'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance
  }
}

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const api = axios.create({ baseURL: 'https://api.example.com' })

export default boot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API

  axios.defaults.headers.common[
    'Authorization'
  ] = `Bearer ${LocalStorage.getItem(AUTH_TOKEN)}`

  axios.interceptors.response.use(
    function (response) {
      // Any status code that lie within the range of 2xx cause this function to trigger
      // Do something with response data
      return response
    },
    function (error: AxiosError) {
      // Any status codes that falls outside the range of 2xx cause this function to trigger
      // Do something with response error
      if (
        error.response &&
        error.response.status === 401 &&
        app.config.globalProperties.$route.name !== ROUTER_NAMES.LOGIN
      ) {
        // Aquí puedes realizar la acción que desees cuando se recibe un 401
        Notify.create({
          message: 'Lo siento la sesión a terminado, vuelva a iniciar sesión',
        })
        app.config.globalProperties.$router.push({ name: ROUTER_NAMES.LOGIN })
      }
      return Promise.reject(error)
    }
  )
})

export { api }
