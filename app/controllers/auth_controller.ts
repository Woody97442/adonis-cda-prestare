import Job from '#models/job'
import User from '#models/user'
import { cuid } from '@adonisjs/core/helpers'
import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'

export default class AuthController {
  async register({ request, response }: HttpContext) {
    try {
      const email = request.input('email')
      const password = request.input('password')
      const name = request.input('name')
      const area = request.input('area')
      const tel = request.input('tel')
      const des = request.input('des')
      const job = request.input('job')

      // Check if required fields are filled
      if (!email || !password || !name || !area || !tel || !des || !job) {
        return response.badRequest({ message: 'Missing required fields' })
      }

      // Check if user already exist
      const userExist = await User.findBy('email', email);
      if (userExist) {
        return response.badRequest({ message: 'User already exist' })
      }

      // Check is job exist
      const jobExist = await Job.findBy('id', job);
      if (!jobExist) {
        return response.badRequest({ message: 'Job not found' })
      }

      const image = request.file('img', {
        extnames: ['png', 'jpg', 'jpeg'],
        size: '4mb',
      })

      // Check if image exist
      if (!image || !image.isValid) {
        return response.badRequest({ message: 'Invalid image' })
      }

      const filename = `${cuid()}.${image.extname}`

      // Create new user
      const user = await User.create({
        email: email,
        name: name,
        password: password,
        area: area,
        tel: tel,
        des: des,
        jobId: jobExist.id,
        img: filename,
      })

      await user.save()
      await image.move('public/uploads', { name: filename })

      return response.created({ message: 'User created successfully' })

    } catch (error) {
      console.log(error)
      return response.internalServerError({ message: 'An error occured during registration' })
    }
  }

  async login({ request, response }: HttpContext) {
    try {
      const { email, password } = request.all()

      if (!email || !password) {
        return response.badRequest({ message: 'Missing required fields' })
      }

      const user = await User.findBy('email', email)
      if (!user) {
        return response.badRequest({ message: 'User not found' })
      }

      const isPasswordValid = await hash.verify(user.password, password)
      if (!isPasswordValid) {
        return response.badRequest({ message: 'Invalid password' })
      }

      const isEnabled = user.enabled
      if (!isEnabled) {
        return response.unauthorized({ message: 'Your account is not verified' })
      }

      const token = await User.accessTokens.create(user)

      return response.ok({ token: token.value!.release(), message: 'Login successful' })

    } catch (error) {
      console.log(error)
      return response.internalServerError({ message: 'An error occured during login' })
    }
  }

  async logout({ auth, response }: HttpContext) {
    try {
      User.accessTokens.delete(auth.user as User, auth.user?.currentAccessToken?.identifier as string)
      return response.ok({ message: 'Logout successful' })
    } catch (error) {
      console.log(error)
      return response.internalServerError({ message: 'An error occured during logout' })
    }
  }

}
