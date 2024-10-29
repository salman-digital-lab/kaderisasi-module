import { DateTime } from 'luxon'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DbAccessTokensProvider, AccessToken } from '@adonisjs/auth/access_tokens'
import Role from '#models/role'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class AdminUser extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare displayName: string

  @column()
  declare roleId: number

  @belongsTo(() => Role, {
    foreignKey: 'roleId',
  })
  declare role: BelongsTo<typeof Role>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  currentAccessToken?: AccessToken

  static authTokens = DbAccessTokensProvider.forModel(AdminUser, {
    expiresIn: '7 days',
    prefix: 'oat_',
    table: 'admin_auth_access_tokens',
    type: 'auth_token',
    tokenSecretLength: 40,
  })
}
