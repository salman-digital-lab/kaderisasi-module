import { HttpContext } from '@adonisjs/core/http'
import Activity from '#models/activity'
import { activityRegistrationValidator } from '#validators/activity_validator'
import ActivityRegistration from '#models/activity_registration'

export default class ActivitiesController {
  async index({ request, response }: HttpContext) {
    try {
      const page = request.qs().page ?? 1
      const perPage = request.qs().per_page ?? 10
      const search = request.qs().search

      const activities = await Activity.query()
        .select('*')
        .where('name', 'ILIKE', search ? '%' + search + '%' : '%%')
        .where('is_published', 1)
        .orderBy('id', 'desc')
        .paginate(page, perPage)

      activities.map((item) => {
        item.additionalConfig = JSON.parse(item.additionalConfig)
        item.additionalQuestionnaire = JSON.parse(item.additionalQuestionnaire)
      })

      return response.ok({
        messages: 'GET_DATA_SUCCESS',
        data: activities,
      })
    } catch (error) {
      return response.internalServerError({
        message: 'GENERAL_ERROR',
        error: error.message,
      })
    }
  }

  async show({ params, response }: HttpContext) {
    try {
      const slug: number = params.slug
      var activityData = await Activity.query().where({ is_published: 1, slug: slug }).firstOrFail()

      activityData.additionalConfig = JSON.parse(activityData.additionalConfig)
      activityData.additionalQuestionnaire = JSON.parse(activityData.additionalQuestionnaire)

      return response.ok({
        message: 'GET_DATA_SUCCESS',
        data: activityData,
      })
    } catch (error) {
      return response.internalServerError({
        message: 'GENERAL_ERROR',
        error: error.message,
      })
    }
  }

  async register({ params, request, response, auth }: HttpContext) {
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
      return response.internalServerError({
        message: 'GENERAL_ERROR',
        error: error.message,
      })
    }
  }
}
