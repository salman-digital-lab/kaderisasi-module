import { HttpContext } from '@adonisjs/core/http'
import Activity from '#models/activity'
import { activityRegistrationValidator } from '#validators/activity_validator'
import ActivityRegistration from '#models/activity_registration'

export default class ActivitiesController {
  async index({ request, response, logger }: HttpContext) {
    try {
      const page = request.qs().page ?? 1
      const perPage = request.qs().per_page ?? 10
      const search = request.qs().search

      const activities = await Activity.query()
        .select('*')
        .where('name', 'ILIKE', search ? '%' + search + '%' : '%%')
        .where('activity_type', 'ILIKE', search ? '%' + search + '%' : '%%')
        .orderBy('id', 'desc')
        .paginate(page, perPage)

      return response.ok({
        messages: 'GET_DATA_SUCCESS',
        data: activities,
      })
    } catch (error) {
      logger.error(this.logError(error.status, error.message))
      return response.internalServerError({
        message: 'GENERAL_ERROR',
        error: error.message,
      })
    }
  }

  async show({ params, response, logger }: HttpContext) {
    try {
      const slug: number = params.slug
      const activityData = await Activity.findByOrFail('slug', slug)

      return response.ok({
        message: 'GET_DATA_SUCCESS',
        data: activityData,
      })
    } catch (error) {
      logger.error(this.logError(error.status, error.message))
      return response.internalServerError({
        message: 'GENERAL_ERROR',
        error: error.message,
      })
    }
  }

  async register({ params, request, response, auth, logger }: HttpContext) {
    try {
      const activityId: number = params.id
      const user = auth.getUserOrFail()
      const data = await activityRegistrationValidator.validate(request.all())

      const registration = await ActivityRegistration.create({
        userId: user.id,
        activityId: activityId,
        status: data.status,
        questionnaireAnswer: data.questionnaire_answer,
      })

      return response.ok({
        message: 'ACTIVITY_REGISTER_SUCCESS',
        data: registration,
      })
    } catch (error) {
      logger.error(this.logError(error.status, error.message))
      return response.internalServerError({
        message: 'GENERAL_ERROR',
        error: error.message,
      })
    }
  }

  logError(status: string, message: string): string {
    const errorData = 'status: ' + status + '// ' + 'message' + message
    return errorData
  }
}
