import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { tagValidation } from '@/validations/tagValidation'
import { tagController } from '@/controllers/tagController'

const Router = express.Router()

// Router.route('/')
//   .get((req, res) => {
//     res.status(StatusCodes.OK).json({ message: 'GET: API get list tags' })
//   })
//   .tag(tagValidation.createNew, tagController.createNew)

// Router.route('/:id').get(tagController.getDetails).put(tagValidation.update, tagController.update)

// Router.route('/supports/moving_card').put(tagValidation.moveCardToDifferentColumn, tagController.moveCardToDifferentColumn)
Router.get('/', tagController.getAll)

Router.post('/', tagValidation.createNew, tagController.createNew)
Router.route('/:id').put(tagValidation.update, tagController.update).delete(tagValidation.update, tagController.deleteTag).get(tagController.getDetails)
export const tagRouter = Router
