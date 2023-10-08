import axios from 'axios'
import { boot } from 'quasar/wrappers'
import { ROUTER_NAMES } from 'src/router'
import { useAuthStore } from 'src/stores/auth-store'

export default boot(async ({ router, store }) => {
  async function isAuth(): Promise<boolean> {
    const authStore = useAuthStore(store)
    const token = authStore.token

    if (!token) {
      return false
    }

    try {
      const response = await axios.get(`${process.env.API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      console.log(response)
      return true
    } catch {
      return false
    }
  }

  router.beforeEach(async (to) => {
    if (to.name !== 'login') {
      if (!(await isAuth())) {
        return { name: ROUTER_NAMES.LOGIN }
      } else {
        return true
      }
    }
    return
    // else if (to.name === 'login' && from.name === undefined) {
    //   console.log('esta en login')
    //   if (await isAuth()) {
    //     console.log('redirigiendo a home')
    //     return { name: ROUTER_NAMES.HOME }
    //   } else {
    //     console.log(
    //       'es false el auth entonces lo returno true y deberia quedarse aqui'
    //     )
    //     return true
    //   }
    // }
  })
})
