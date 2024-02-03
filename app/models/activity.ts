import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Activity extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare slug: string

  @column()
  declare description: string

  @column.dateTime()
  declare activityStart: DateTime

  @column.dateTime()
  declare activityEnd: DateTime

  @column.dateTime()
  declare registrationStart: DateTime

  @column.dateTime()
  declare registrationEnd: DateTime

  @column.dateTime()
  declare selectionStart: DateTime

  @column.dateTime()
  declare selectionEnd: DateTime

  @column()
  declare minimumRole: number

  @column()
  declare activityType: string

  @column()
  declare additionalQuestionnaire: string

  @column()
  declare additionalConfig: string

  @column()
  declare isPublished: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
