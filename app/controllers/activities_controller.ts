import { HttpContext } from '@adonisjs/core/http'
import Activity from '#models/activity'
import { activityRegistrationValidator } from '#validators/activity_validator'
import ActivityRegistration from '#models/activity_registration'
import Profile from '#models/profile'

export default class ActivitiesController {
  async index({ request, response }: HttpContext) {
    try {
      const page = request.qs().page ?? 1
      const perPage = request.qs().per_page ?? 10
      const search = request.qs().search

      type Clause = {
        activity_category: number
      }

      const clause = <Clause>{}

      if (request.qs().category) {
        clause.activity_category = request.qs().category
      }

      const activities = await Activity.query()
        .select('*')
        .where(clause)
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
    const data = await activityRegistrationValidator.validate(request.all())
    const user = auth.getUserOrFail()
    try {
      const activitySlug: number = params.slug
      const userData = await Profile.findOrFail(user.id)
      const activity = await Activity.findByOrFail('slug', activitySlug)

      if (userData.level < activity.minimumLevel) {
        return response.forbidden({
          message: 'UNMATCHED_LEVEL',
        })
      }
      const registration = await ActivityRegistration.create({
        userId: user.id,
        activityId: activity.id,
        status: 'REGISTERED',
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
