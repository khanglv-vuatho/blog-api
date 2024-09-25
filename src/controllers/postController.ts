import { TYPESFROM } from '@/constants'
import { postService } from '@/services/postService'
import { NextFunction, Response, Request } from 'express'
import { StatusCodes } from 'http-status-codes'

const createNew = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Điều hướng sang service
    const createPost = await postService.createNew(req.body, req.file)

    res.status(StatusCodes.CREATED).json(createPost)
  } catch (error) {
    //next(error) để đẩy sang errorhandling
    next(error)
  }
}

const getDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Điều hướng sang service
    const getDetails: any = await postService.getDetailsBySlug(req.params.id)

    res.status(StatusCodes.OK).json(getDetails)
  } catch (error) {
    //next(error) để đặt sang errorhandling
    next(error)
  }
}

const getAll = async (req: Request, res: Response, next: NextFunction) => {
  // Điều hướng sang service
  try {
    const { type, page, limit } = req.query
    console.log({ page, limit })
    const getAllPost = await postService.getAll(type as string, Number(page), Number(limit))

    res.status(StatusCodes.OK).json(getAllPost)
  } catch (error) {
    next(error)
  }
}

const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = req.file
    // Điều hướng sang service

    const updatePost = await postService.update(req.params.id, req.body, file)

    res.status(StatusCodes.OK).json(updatePost)
  } catch (error) {
    next(error)
  }
}

const deleteOneById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Điều hướng sang service
    const deleteOneById = await postService.deleteOneById(req.params.id)

    res.status(StatusCodes.OK).json(deleteOneById)
  } catch (error) {
    next(error)
  }
}

const getAllTagAndCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Điều hướng sang service
    const getAllTagAndCategory = await postService.getAllTagAndCategory()

    res.status(StatusCodes.OK).json(getAllTagAndCategory)
  } catch (error) {
    next(error)
  }
}

const findBySlugCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Điều hướng sang service

    const findBySlugCategory = await postService.findBySlugCategory(req.query.slug as any)
    res.status(StatusCodes.OK).json(findBySlugCategory)
  } catch (error) {
    next(error)
  }
}

const findBySlugTag = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Điều hướng sang service
    const findBySlugTag = await postService.findBySlugTag(req.query as any)
    res.status(StatusCodes.OK).json(findBySlugTag)
  } catch (error) {
    next(error)
  }
}

const getPopular = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Điều hướng sang service
    const getPopular = await postService.getPopular()
    res.status(StatusCodes.OK).json(getPopular)
  } catch (error) {
    next(error)
  }
}

// Get all post by slug tag
const getAllBySlugTag = async (req: Request, res: Response, next: NextFunction) => {
  const { page, limit, slug } = req.query
  try {
    const getAllBySlugTag = await postService.getAllBySlugTag(slug as string, Number(page), Number(limit))
    res.status(StatusCodes.OK).json(getAllBySlugTag)
  } catch (error) {
    next(error)
  }
}

const searchPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { keyword, page, limit } = req.query
    console.log({ keyword, page, limit })
    if (keyword === '') {
      const getAllPost = await postService.getAll(TYPESFROM.WEB, Number(page), Number(limit))
      return res.status(StatusCodes.OK).json(getAllPost)
    }
    const searchResults = await postService.searchPost(keyword as string, Number(page), Number(limit))
    res.status(StatusCodes.OK).json(searchResults)
  } catch (error) {
    next(error)
  }
}

export const postController = {
  createNew,
  getDetails,
  getAll,
  getPopular,
  update,
  deleteOneById,
  getAllTagAndCategory,
  findBySlugCategory,
  findBySlugTag,
  getAllBySlugTag,
  searchPost
}
