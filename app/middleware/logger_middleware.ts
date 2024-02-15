import { HttpContext } from '@adonisjs/core/http'
import { NextFn } from '@adonisjs/core/types/http'

export default class {
  async handle({ request, response, logger }: HttpContext, next: NextFn) {
    await next()
    const datetime = new Date().toLocaleString()
    logger.info(
      'Datetime:' +
        datetime +
        ' | IP: ' +
        request.ip() +
        ' | Method: ' +
        request.method() +
        ' | URL: ' +
        request.url() +
        ' | Response Status: ' +
        JSON.stringify(response.getStatus()) +
        ' | Response body: ' +
        JSON.stringify(response.getBody())
    )
  }
}
