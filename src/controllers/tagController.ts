import { tagService } from '@/services/tagService'
import { NextFunction, Response, Request } from 'express'
import { StatusCodes } from 'http-status-codes'

const createNew = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Điều hướng sang service

    const createTag = await tagService.createNew(req.body)

    res.status(StatusCodes.CREATED).json(createTag)
  } catch (error) {
    //next(error) để đẩy sang errorhandling
    next(error)
  }
}
const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type } = req.query
    // Điều hướng sang service
    const getAllTag = await tagService.getAll(type as string, req.query.page as any, req.query.limit as any)

    res.status(StatusCodes.OK).json(getAllTag)
  } catch (error) {
    //next(error) để đầuy sang errorhandling
    next(error)
  }
}

const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Điều hướng sang service
    const updateTag = await tagService.update(req.params.id, req.body)

    res.status(StatusCodes.OK).json(updateTag)
  } catch (error) {
    next(error)
  }
}

const deleteTag = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Điều hướng sang service
    const deleteTag = await tagService.deleteTag(req.params.id) // req.params.id

    res.status(StatusCodes.OK).json(deleteTag)
  } catch (error) {
    next(error)
  }
}

const getDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Điều hướng sang service
    const getDetails = await tagService.getDetails(req.params.id)

    res.status(StatusCodes.OK).json(getDetails)
  } catch (error) {
    next(error)
  }
}

export const tagController = {
  createNew,
  getAll,
  update,
  deleteTag,
  getDetails
}
