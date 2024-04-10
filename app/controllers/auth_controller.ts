import { HttpContext } from '@adonisjs/core/http'
import {
  registerValidator,
  loginValidator,
  resetPasswordValidator,
} from '#validators/auth_validator'
import database from '@adonisjs/lucid/services/db'
import hash from '@adonisjs/core/services/hash'
import PublicUser from '#models/public_user'
import Profile from '#models/profile'
import mail from '@adonisjs/mail/services/main'
import encryption from '@adonisjs/core/services/encryption'
import env from '#start/env'

export default class AuthController {
  async register({ request, response }: HttpContext) {
    const payload = await registerValidator.validate(request.all())
    try {
      const exist = await PublicUser.findBy('email', payload.email)

      if (exist) {
        return response.conflict({
          message: 'EMAIL_ALREADY_REGISTERED',
        })
      }

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
        error: error.message,
      })
    }
  }

  async login({ request, response }: HttpContext) {
    const payload = await loginValidator.validate(request.all())
    try {
      const email: string = payload.email
      const password: string = payload.password
      const user = await PublicUser.query().where('email', email).first()

      if (!user) {
        return response.notFound({
          message: 'USER_NOT_FOUND',
        })
      }

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

      const encrypted = encryption.encrypt(email, '30 minutes')
      const resetUrl: string = env.get('RESET_PASSWORD_URL') + '?token=' + encrypted
      const fromAddress: string = env.get('MAIL_FROM')

      await mail.send((message) => {
        message
          .to(user.email)
          .from(fromAddress, 'Kaderisasi Masjid Salman ITB')
          .subject('Reset kata sandi akun Kaderisasi Masjid Salman ITB')
          .htmlView('emails/reset_password', { resetUrl })
      })

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

  async resetPassword({ request, response }: HttpContext) {
    const token: string = request.qs().token
    const { password } = await resetPasswordValidator.validate(request.all())
    try {
      const decrypted = encryption.decrypt(token)
      const user = await PublicUser.findBy('email', decrypted)

      if (!user) {
        return response.unauthorized({
          message: 'INVALID_TOKEN',
        })
      }

      await user.merge({ password: password }).save()

      return response.ok({
        message: 'RESET_PASSWORD_SUCCESS',
      })
    } catch (error) {
      return response.internalServerError({
        message: 'GENERAL_ERROR',
        error: error.message,
      })
    }
  }

  async logout({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    try {
      await PublicUser.authTokens.delete(user, user.currentAccessToken.identifier)
      return response.ok({
        message: 'LOGOUT_SUCCESS',
      })
    } catch (error) {
      return response.internalServerError({
        message: 'GENERAL_ERROR',
        error: error.message,
      })
    }
  }
}
