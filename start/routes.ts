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

// Routes not requiring authentication
router.post('/register', '#controllers/auth_controller.register')
router.post('/login', '#controllers/auth_controller.login')
router.get('/users', '#controllers/users_controller.getUsersIsEnabled')

// Routes requiring authentication
router.group(() => {
  router.get('/profile', '#controllers/users_controller.profile')
  router.get('/logout', '#controllers/auth_controller.logout')
  // CRUD Routes
  router.patch('/profile', '#controllers/users_controller.updateProfile')
  router.patch('/profile/img', '#controllers/users_controller.updateProfileImage')
  router.patch('/profile/password', '#controllers/users_controller.updateProfilePassword')
}).use(middleware.auth({ guards: ['api'] }))

// Routes requiring authentication and admin
router.group(() => {
  router.get('/users', '#controllers/users_controller.getUsersWithoutAdmin')
  router.get('/user/:id', '#controllers/users_controller.getUser')
  router.patch('/user/:id', '#controllers/users_controller.updateUserWithId')
  router.patch('/user/:id/img', '#controllers/users_controller.updateProfileImageWithId')
  router.patch('/user/:id/password', '#controllers/users_controller.updateProfilePasswordWithId')
  router.delete('/user/:id', '#controllers/users_controller.deleteUserWithId')
  router.post('/user/:id/enabled', '#controllers/users_controller.enabledUserWithId')
}).prefix('/admin')
  .use([middleware.auth({ guards: ['api'] }), middleware.isAdmin()])


