import { DateTime } from 'luxon'
import { BaseModel, column, hasOne } from '@adonisjs/lucid/orm'
import type { HasOne } from '@adonisjs/lucid/types/relations'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import hash from '@adonisjs/core/services/hash'
import { DbAccessTokensProvider, AccessToken } from '@adonisjs/auth/access_tokens'
import { compose } from '@adonisjs/core/helpers'
import Profile from '#models/profile'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class PublicUser extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @hasOne(() => Profile, {
    foreignKey: 'userId',
  })
  declare profile: HasOne<typeof Profile>

  currentAccessToken?: AccessToken

  static authTokens = DbAccessTokensProvider.forModel(PublicUser, {
    expiresIn: '7 days',
    prefix: 'oat_',
    table: 'public_auth_access_tokens',
    type: 'auth_token',
    tokenSecretLength: 40,
  })
}
