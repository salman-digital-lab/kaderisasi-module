import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const AuthController = () => import('#controllers/auth_controller')
const ProfilesController = () => import('#controllers/profiles_controller')
const ActivitiesController = () => import('#controllers/activities_controller')

router
  .group(() => {
    router
      .group(() => {
        router.post('register', [AuthController, 'register'])
        router.post('login', [AuthController, 'login'])
        router.post('forgot-password', [AuthController, 'sendPasswordRecovery'])
      })
      .prefix('auth')

    router
      .group(() => {
        router.put('', [ProfilesController, 'update'])
        router.get('', [ProfilesController, 'show'])
        router.get('activities', [ProfilesController, 'activities'])
      })
      .prefix('profiles')
      .use(
        middleware.auth({
          guards: ['api'],
        })
      )

    router
      .group(() => {
        router.post('register/:id', [ActivitiesController, 'register']).use(
          middleware.auth({
            guards: ['api'],
          })
        )
        router.get('/:slug', [ActivitiesController, 'show'])
        router.get('', [ActivitiesController, 'index'])
      })
      .prefix('activities')
  })
  .prefix('v2')
