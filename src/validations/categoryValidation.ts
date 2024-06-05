import Joi from 'joi'
import { NextFunction, Response, Request } from 'express'
import { StatusCodes } from 'http-status-codes'

import ApiError from '@/utils/ApiError'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '@/utils/validators'

const createNew = async (req: Request, res: Response, next: NextFunction) => {
  const correctCondition = Joi.object({
    title: Joi.string().required().max(50).strict().required(),
    tags: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([])
  })
  try {
    // set abortEarly: false trả ra nhiều lỗi validation nếu có
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error: any) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const update = async (req: Request, res: Response, next: NextFunction) => {
  const correctCondition = Joi.object({
    _id: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    title: Joi.string().max(50).strict(),
    tags: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([])
  })
  try {
    // set abortEarly: false trả ra nhiều lỗi validation nếu có
    await correctCondition.validateAsync({ ...req.body, _id: req.params.id }, { abortEarly: false, allowUnknown: true })
    next()
  } catch (error: any) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const pushTagId = async (req: Request, res: Response, next: NextFunction) => {
  const correctCondition = Joi.object({
    categoryId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).required(),
    tagId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).required()
  })
  try {
    // set abortEarly: false trả ra nhiều lỗi validation nếu có
    await correctCondition.validateAsync({ ...req.body, categoryId: req.params.id }, { abortEarly: false })
    next()
  } catch (error: any) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const deleteOneById = async (req: Request, res: Response, next: NextFunction) => {
  const correctCondition = Joi.object({
    categoryId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).required()
  })
  try {
    // set abortEarly: false trả ra nhiều lỗi validation nếu có
    await correctCondition.validateAsync({ categoryId: req.params.id }, { abortEarly: false })
    next()
  } catch (error: any) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

export const categoryValidation = {
  createNew,
  update,
  pushTagId,
  deleteOneById
}
