import type { HttpContext } from '@adonisjs/core/http'

export default class UsersController {

  async profile({ auth, response }: HttpContext) {
    const user = await auth.authenticate()
    const { password, enabled, isAdmin, ...userInfo } = user.$attributes
    return response.ok(userInfo)
  }

}
