import Job from '#models/job'
import User from '#models/user'
import { cuid } from '@adonisjs/core/helpers'
import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash';
import fs from 'fs/promises';
export default class UsersController {

  async profile({ auth, response }: HttpContext) {
    const user = await auth.authenticate()
    const { password, enabled, isAdmin, ...userInfo } = user.$attributes
    return response.ok(userInfo)
  }

  async getUsersIsEnabled({ response }: HttpContext) {
    const users = await User.findManyBy({ enabled: "1", isadmin: "0" })
    const usersInfo: User[] = []
    users.map(user => {
      const { password, enabled, isAdmin, createdAt, updatedAt, ...userInfo } = user.$attributes
      usersInfo.push(userInfo as User)
    })
    return response.ok(usersInfo)
  }

  // CRUD User Not Admin
  // Update user profile
  async updateProfile({ request, auth, response }: HttpContext) {
    try {
      const user = await auth.authenticate()
      const { name, email, area, tel, job, des } = request.all()

      // Check is job exist
      const jobExist = await Job.findBy('id', job);
      if (!jobExist) {
        return response.badRequest({ message: 'Job not found' })
      }

      if (name || email || area || tel || job || des) {
        user.name = name || user.name
        user.email = email || user.email
        user.area = area || user.area
        user.tel = tel || user.tel
        user.jobId = job || user.jobId
        user.des = des || user.des

        await user.save()

        const { password, enabled, isAdmin, createdAt, updatedAt, ...userInfo } = user.$attributes
        return response.ok({ userUpdated: userInfo, message: 'Profile updated successfully' })
      }

      return response.ok({ message: 'Nothing to update' })
    } catch (error) {
      console.log(error)
      return response.internalServerError({ message: 'An error occured during profile update' })
    }
  }

  // Update user image profile
  async updateProfileImage({ request, auth, response }: HttpContext) {
    try {
      const user = await auth.authenticate()

      const image = request.file('img', {
        extnames: ['png', 'jpg', 'jpeg'],
        size: '4mb',
      })

      // Check if image exist
      if (!image || !image.isValid) {
        return response.badRequest({ message: 'Invalid image' })
      }

      const newFilename = `${cuid()}.${image.extname}`

      const lastFilename = user?.img
      // Vérifie si le fichier existe
      if (lastFilename) {
        try {
          await fs.access(`public/uploads/${lastFilename}`);
          // Le fichier existe, vous pouvez procéder à la suppression
          await fs.unlink(`public/uploads/${lastFilename}`);
          console.log('Fichier supprimé avec succès.');
        } catch (error) {
          // Une erreur s'est produite lors de l'accès ou le fichier n'existe pas
          console.error('Le fichier n\'existe pas ou une erreur est survenue :', error);
        }
      }

      user.img = newFilename

      await user.save()
      await image.move('public/uploads', { name: newFilename })

      return response.ok({ message: 'Profile image updated successfully' })

    } catch (error) {
      console.log(error)
      return response.internalServerError({ message: 'An error occured during profile image update' })
    }

  }

  // Update user password
  async updateProfilePassword({ request, auth, response }: HttpContext) {
    try {
      const user = await auth.authenticate()
      const { oldPassword, password } = request.all()

      if (!password || !oldPassword) {
        return response.badRequest({ message: 'Missing required fields' })
      }

      if (password === oldPassword) {
        return response.badRequest({ message: 'New password cannot be the same as old password' })
      }

      const isPasswordValid = await hash.verify(user.password, oldPassword)
      if (!isPasswordValid) {
        return response.badRequest({ message: 'Invalid oldPassword' })
      }

      user.password = password
      await user.save()
      return response.ok({ message: 'Password updated successfully' })
    } catch (error) {
      console.log(error)
      return response.internalServerError({ message: 'An error occured during password update' })
    }
  }

  // CRUD User Admin
  async getUsersWithAdmin({ response }: HttpContext) {
    const users = await User.findManyBy('isadmin', "0")
    const usersInfo: User[] = []
    users.map(user => {
      const { password, isAdmin, ...userInfo } = user.$attributes
      usersInfo.push(userInfo as User)
    })
    return response.ok(usersInfo)
  }

  async getUser({ request, response }: HttpContext) {
    try {
      const { id } = request.all()
      const user = await User.find(id)
      if (!user) {
        return response.notFound({ message: 'User not found' })
      }
      const { password, isAdmin, ...userInfo } = user.$attributes
      return response.ok(userInfo)
    } catch (error) {
      console.log(error)
      return response.internalServerError({ message: 'An error occured during user get' })
    }
  }

  async updateUserWithId({ request, response }: HttpContext) {
    try {
      const idUser = request.params().id
      const { name, email, area, tel, job, des } = request.all()
      const user = await User.find(idUser)
      if (!user) {
        return response.notFound({ message: 'User not found' })
      }

      // Check is job exist
      const jobExist = await Job.findBy('id', job);
      if (!jobExist) {
        return response.badRequest({ message: 'Job not found' })
      }

      if (name || email || area || tel || job || des) {
        user.name = name || user.name
        user.email = email || user.email
        user.area = area || user.area
        user.tel = tel || user.tel
        user.jobId = job || user.jobId
        user.des = des || user.des

        await user.save()

        const { password, isAdmin, createdAt, updatedAt, ...userInfo } = user.$attributes
        return response.ok({ userUpdated: userInfo, message: 'Profile updated successfully' })
      }

      return response.ok({ message: 'Nothing to update' })
    } catch (error) {
      console.log(error)
      return response.internalServerError({ message: 'An error occured during profile update' })
    }
  }

  async updateProfileImageWithId({ request, response }: HttpContext) {
    try {
      const idUser = request.params().id
      const user = await User.find(idUser)

      if (!user) {
        return response.notFound({ message: 'User not found' })
      }

      const image = request.file('img', {
        extnames: ['png', 'jpg', 'jpeg'],
        size: '4mb',
      })

      // Check if image exist
      if (!image || !image.isValid) {
        return response.badRequest({ message: 'Invalid image' })
      }

      const newFilename = `${cuid()}.${image.extname}`

      const lastFilename = user.img
      // Vérifie si le fichier existe
      if (lastFilename) {
        try {
          await fs.access(`public/uploads/${lastFilename}`);
          // Le fichier existe, vous pouvez procéder à la suppression
          await fs.unlink(`public/uploads/${lastFilename}`);
          console.log('Fichier supprimé avec succès.');
        } catch (error) {
          // Une erreur s'est produite lors de l'accès ou le fichier n'existe pas
          console.error('Le fichier n\'existe pas ou une erreur est survenue :', error);
        }
      }

      user.img = newFilename

      await user.save()
      await image.move('public/uploads', { name: newFilename })

      return response.ok({ message: 'Profile image updated successfully' })

    } catch (error) {
      console.log(error)
      return response.internalServerError({ message: 'An error occured during profile image update' })
    }

  }

  async updateProfilePasswordWithId({ request, response }: HttpContext) {
    try {
      const idUser = request.params().id
      const user = await User.find(idUser)

      if (!user) {
        return response.notFound({ message: 'User not found' })
      }

      const { oldPassword, password } = request.all()

      if (!password || !oldPassword) {
        return response.badRequest({ message: 'Missing required fields' })
      }

      if (password === oldPassword) {
        return response.badRequest({ message: 'New password cannot be the same as old password' })
      }

      const isPasswordValid = await hash.verify(user.password, oldPassword)
      if (!isPasswordValid) {
        return response.badRequest({ message: 'Invalid oldPassword' })
      }

      user.password = password
      await user.save()
      return response.ok({ message: 'Password updated successfully' })
    } catch (error) {
      console.log(error)
      return response.internalServerError({ message: 'An error occured during password update' })
    }
  }

  async deleteUserWithId({ request, response }: HttpContext) {
    try {
      const idUser = request.params().id
      const user = await User.find(idUser)

      if (!user) {
        return response.notFound({ message: 'User not found' })
      }

      await user.delete()
      return response.ok({ message: 'Delete user successfully' })
    } catch (error) {
      console.log(error)
      return response.internalServerError({ message: 'An error occured during delete user' })
    }
  }

  async enabledUserWithId({ request, response }: HttpContext) {
    try {
      const idUser = request.params().id
      const user = await User.find(idUser)

      if (!user) {
        return response.notFound({ message: 'User not found' })
      }

      if (user.$extras.isAdmin) {
        return response.internalServerError({ message: 'You are not authorized to perform this action' })
      }

      user.enabled = !user.enabled

      await user.save()
      return response.ok({ message: 'Change status user successfully' })
    } catch (error) {
      console.log(error)
      return response.internalServerError({ message: 'An error occured during enabled user' })
    }
  }

}
