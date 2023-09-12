import { AuthApi, User } from './../api-client/api'
import { defineStore } from 'pinia'
import { LocalStorage } from 'quasar'

export const AUTH_USER = 'authUser'
export const AUTH_TOKEN = 'accessToken'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: LocalStorage.getItem(AUTH_USER) as User | null,
    token: LocalStorage.getItem<string>(AUTH_TOKEN) || '',
  }),
  getters: {
    fullname: ({ user }) =>
      user
        ? `${user.name} ${user?.paternalSurname} ${user?.maternalSurname}`
        : 'Usuario Invitado',
  },
  actions: {
    async login(email: string, password: string) {
      try {
        const response = await new AuthApi().authControllerLogin({
          email,
          password,
        })
        this.user = response.data.data?.user as User
        this.token = response.data.data?.access_token as string

        LocalStorage.set(AUTH_USER, this.user)
        LocalStorage.set(AUTH_TOKEN, this.token)
      } catch (e) {
        throw new Error('Error en las claves de acceso')
      }
    },
  },
})
