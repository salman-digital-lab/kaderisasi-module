import { HttpContext } from '@adonisjs/core/http'
import { registerValidator, loginValidator } from '#validators/auth_validator'
import database from '@adonisjs/lucid/services/db'
import hash from '@adonisjs/core/services/hash'
import PublicUser from '#models/public_user'
import Profile from '#models/profile'

export default class AuthController {
  async register({ request, response }: HttpContext) {
    try {
      const payload = await registerValidator.validate(request.all())

      await database.transaction(async (trx) => {
        const user = new PublicUser()
        user.email = payload.email
        user.password = payload.password

        user.useTransaction(trx)
        await user.save()

        await user.related('profile').create({
          name: payload.fullname,
        })

        return response.ok({
          message: 'REGISTER_SUCCESS',
          data: user,
        })
      })
    } catch (error) {
      return response.internalServerError({
        message: 'GENERAL_ERROR',
        error: error.stack,
      })
    }
  }

  async login({ request, response }: HttpContext) {
    try {
      const payload = await loginValidator.validate(request.all())
      const email: string = payload.email
      const password: string = payload.password
      const user = await PublicUser.query().where('email', email).firstOrFail()

      if (!(await hash.verify(user.password, password))) {
        return response.unauthorized({
          message: 'WRONG_PASSWORD',
        })
      }

      const data = await Profile.findBy('user_id', user.id)
      const token = await PublicUser.authTokens.create(user)

      return response.ok({
        message: 'LOGIN_SUCCESS',
        data: { user, data, token },
      })
    } catch (error) {
      return response.internalServerError({
        message: 'GENERAL_ERROR',
        error: error.message,
      })
    }
  }

  async sendPasswordRecovery({ request, response }: HttpContext) {
    try {
      const email: string = request.all().email
      const user = await PublicUser.findBy('email', email)

      if (!user) {
        return response.notFound({
          message: 'EMAIL_NOT_FOUND',
        })
      }

      // need to install & implement adonis mail here
      return response.ok({
        message: 'SEND_EMAIL_SUCCESS',
      })
    } catch (error) {
      return response.internalServerError({
        message: 'GENERAL_ERROR',
        error: error.message,
      })
    }
  }
}
