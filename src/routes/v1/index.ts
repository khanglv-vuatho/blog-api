import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { postRouter } from './postsRouter'
import { categoryRouter } from './categorys'
import { tagRouter } from './tagRouter'

const Router = express.Router()

Router.get('/status', (req, res) => {
  //check api v1 status
  res.status(StatusCodes.OK).json({ message: 'api v1 are ready to use' })
})

Router.use('/posts', postRouter)

Router.use('/categorys', categoryRouter)

Router.use('/tags', tagRouter)

//export Router set name is APIs_V1
export const APIs_V1 = Router
