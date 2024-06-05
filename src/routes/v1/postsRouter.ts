import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { postController } from '@/controllers/postController'
import { postValidation } from '@/validations/postValidation'
import multer from 'multer'

const Router = express.Router()
const upload = multer()

Router.route('/').get(postController.getAll).post(upload.single('file'), postValidation.createNew, postController.createNew)

Router.route('/supports/get-all-tag-and-category').get(postController.getAllTagAndCategory)

Router.route('/:id')
  .get(postController.getDetails)
  .put(postValidation.update, postController.update)
  .delete(postValidation.deleteOneById, postController.deleteOneById)

Router.route('/:id/update-post').put(upload.single('thumbnail'), postController.update)

Router.route('/supports/find-by-slug-category').get(postController.findBySlugCategory)

Router.route('/supports/find-by-slug-tag').get(postController.findBySlugTag)

export const postRouter = Router
