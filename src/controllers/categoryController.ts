import { categoryService } from '@/services/categoryService'
import { NextFunction, Response, Request } from 'express'
import { StatusCodes } from 'http-status-codes'

const createNew = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Điều hướng sang service

    const createPost = await categoryService.createNew(req.body)

    res.status(StatusCodes.CREATED).json(createPost)
  } catch (error) {
    //next(error) để đẩy sang errorhandling
    next(error)
  }
}

const getDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Điều hướng sang service

    const getDetails = await categoryService.getDetails(req.params.id)

    res.status(StatusCodes.OK).json(getDetails)
  } catch (error) {
    next(error)
  }
}

const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, page, limit } = req.query

    // Điều hướng sang service
    const getAllCategory = await categoryService.getAll(type as string, Number(page), Number(limit))

    res.status(StatusCodes.OK).json(getAllCategory)
  } catch (error) {
    next(error)
  }
}

const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Điều hướng sang service
    const updateCategory = await categoryService.update(req.params.id, req.body)

    res.status(StatusCodes.OK).json(updateCategory)
  } catch (error) {
    next(error)
  }
}

const pushTagId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Điều hướng sang service
    const pushTagId = await categoryService.pushTagId(req.params.id, req.body)

    res.status(StatusCodes.OK).json(pushTagId)
  } catch (error) {
    next(error)
  }
}

const deleteOneById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Điều hướng sang service
    const deleteOneById = await categoryService.deleteOneById(req.params.id)

    res.status(StatusCodes.OK).json(deleteOneById)
  } catch (error) {
    next(error)
  }
}

export const categoryController = {
  createNew,
  getDetails,
  getAll,
  update,
  pushTagId,
  deleteOneById
}
