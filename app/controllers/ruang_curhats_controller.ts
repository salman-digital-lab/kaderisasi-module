import type { HttpContext } from '@adonisjs/core/http'
import RuangCurhat from '#models/ruang_curhat'
import { storeRuangCurhatValidator } from '#validators/ruang_curhat_validator'
import AdminUser from '#models/admin_user'
import mail from '@adonisjs/mail/services/main'

export default class RuangCurhatsController {
  async store({ auth, request, response }: HttpContext) {
    const payload = await storeRuangCurhatValidator.validate(request.all())
    const userId = auth.user?.id
    try {
      const insert = {
        status: 0,
        user_id: userId,
      }

      const ruangCurhat = await RuangCurhat.create({ ...payload, ...insert })
      await mail.send((message) => {
        message
          .to('example@mail.com')
          .from('info@example.org')
          .subject('Pengajuan Ruang Curhat')
          .htmlView('emails/verify_email', { ruangCurhat })
      })

      return response.ok({
        messages: 'CREATE_DATA_SUCCESS',
      })
    } catch (error) {
      return response.internalServerError({
        message: 'GENERAL_ERROR',
        error: error.message,
      })
    }
  }
}
