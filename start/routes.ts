/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

router.post('/register', '#controllers/auth_controller.register')
router.post('/login', '#controllers/auth_controller.login')

router.group(() => {
  router.get('/profile', '#controllers/users_controller.profile')
  router.get('/logout', '#controllers/auth_controller.logout')
}).use(middleware.auth({ guards: ['api'] }))
