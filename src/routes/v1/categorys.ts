import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { categoryValidation } from '@/validations/categoryValidation'
import { categoryController } from '@/controllers/categoryController'

const Router = express.Router()

Router.get('/', categoryController.getAll)

Router.post('/', categoryController.createNew)

Router.route('/:id')
  .get(categoryController.getDetails)
  .put(categoryValidation.update, categoryController.update)
  .post(categoryValidation.pushTagId, categoryController.pushTagId)
  .delete(categoryValidation.deleteOneById, categoryController.deleteOneById)

export const categoryRouter = Router
