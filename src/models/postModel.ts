import Joi from 'joi'

import { ObjectId } from 'mongodb'
import { GET_DB } from '@/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '@/utils/validators'
import { tagModel } from './tagModel'
import { categoryModel } from './categoryModel'
import { PostData } from '@/type'
import { matchCondition } from '@/utils/matchCondition'

const POST_COLLECTION_NAME = 'posts'
const POST_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().max(50).strict(),
  description: Joi.string().required().strict(),
  categoryId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).required(),
  tagId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).required(),
  thumbnail: Joi.string().required().max(256).strict(),
  detail: Joi.string().required().strict(),
  createAt: Joi.date()
    .timestamp('javascript')
    .default(() => new Date()),
  updateAt: Joi.date().timestamp('javascript').default(null),
  views: Joi.number().required().default(0),
  slug: Joi.string().required().max(50).strict(),
  _destroy: Joi.boolean().default(false)
})

const INVALID_UPDATE_FIELDS = ['_id', 'updateAt']

const validateBeforeCreate = async (data: PostData) => {
  return POST_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false, allowUnknown: true })
}

const createNew = async (data: PostData) => {
  try {
    const db = await GET_DB()
    const validData = await validateBeforeCreate(data)

    if (validData.categoryId) {
      validData.categoryId = new ObjectId(validData.categoryId)
    }

    if (validData.tagId) {
      validData.tagId = new ObjectId(validData.tagId)
    }

    const createPost = await db.collection(POST_COLLECTION_NAME).insertOne(validData)

    return createPost
  } catch (error: any) {
    throw new Error(error)
  }
}

const getDetails = async (postId: string) => {
  try {
    const db = await GET_DB()
    const [post] = await db
      .collection(POST_COLLECTION_NAME)
      .aggregate([
        { $match: { _id: new ObjectId(postId), _destroy: false } },
        {
          $lookup: {
            from: categoryModel.CATEGORY_COLLECTION_NAME,
            localField: 'categoryId',
            foreignField: '_id',
            as: 'category'
          }
        },
        {
          $lookup: {
            from: tagModel.TAG_COLLECTION_NAME,
            localField: 'tagId',
            foreignField: '_id',
            as: 'tags'
          }
        }
      ])
      .toArray()

    return post
  } catch (error: any) {
    throw new Error(error)
  }
}

const getAll = async (type: string) => {
  try {
    const db = await GET_DB()

    const pipeline = [
      {
        $lookup: {
          from: categoryModel.CATEGORY_COLLECTION_NAME,
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $lookup: {
          from: tagModel.TAG_COLLECTION_NAME,
          localField: 'tagId',
          foreignField: '_id',
          as: 'tags'
        }
      }
    ]
    const posts = db
      .collection(POST_COLLECTION_NAME)
      .aggregate([{ $match: matchCondition(type) }, ...pipeline])
      .toArray()

    return posts
  } catch (error: any) {
    throw new Error(error)
  }
}

const update = async (postId: string, data: any) => {
  try {
    Object.keys(data).forEach((fields) => {
      if (INVALID_UPDATE_FIELDS.includes(fields)) {
        delete data[fields]
      }
    })

    const db = await GET_DB()

    if (Array.isArray(data.tags)) {
      data.tags = data.tags.map((tag: string) => new ObjectId(tag))
    }
    if (data.categoryId) {
      data.categoryId = new ObjectId(data.categoryId)
    }

    if (data.tagId) {
      data.tagId = new ObjectId(data.tagId)
    }

    const updatePost = await db.collection(POST_COLLECTION_NAME).findOneAndUpdate({ _id: new ObjectId(postId) }, { $set: data }, { returnDocument: 'after' })

    return updatePost
  } catch (error: any) {
    throw new Error(error)
  }
}

const findOneByTitle = async (title: string) => {
  try {
    const db = await GET_DB()
    const post = await db.collection(POST_COLLECTION_NAME).findOne({ title, _destroy: false })
    return post
  } catch (error: any) {
    throw new Error(error)
  }
}

const deleteOneById = async (postId: string) => {
  try {
    const db = await GET_DB()
    const post = await db.collection(POST_COLLECTION_NAME).deleteOne({ _id: new ObjectId(postId) })

    return post
  } catch (error) {
    throw error
  }
}

const findOneById = async (postId: string) => {
  try {
    const db = await GET_DB()
    const post = await db.collection(POST_COLLECTION_NAME).findOne({ _id: new ObjectId(postId) })
    return post
  } catch (error) {
    throw error
  }
}

const getAllByCategoryId = async (categoryId: ObjectId) => {
  try {
    const db = await GET_DB()
    const pipeline = [
      {
        $lookup: {
          from: categoryModel.CATEGORY_COLLECTION_NAME,
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $lookup: {
          from: tagModel.TAG_COLLECTION_NAME,
          localField: 'tagId',
          foreignField: '_id',
          as: 'tags'
        }
      }
    ]
    const posts = db
      .collection(POST_COLLECTION_NAME)
      .aggregate([{ $match: { categoryId } }, ...pipeline])
      .toArray()

    return posts
  } catch (error) {
    throw error
  }
}

const getAllByTagId = async (tagId: ObjectId) => {
  try {
    const db = await GET_DB()
    const pipeline = [
      {
        $lookup: {
          from: categoryModel.CATEGORY_COLLECTION_NAME,
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $lookup: {
          from: tagModel.TAG_COLLECTION_NAME,
          localField: 'tagId',
          foreignField: '_id',
          as: 'tags'
        }
      }
    ]
    const posts = db
      .collection(POST_COLLECTION_NAME)
      .aggregate([{ $match: { tagId } }, ...pipeline])
      .toArray()

    return posts
  } catch (error) {
    throw error
  }
}

const findOneBySlug = async (slug: string) => {
  try {
    const db = await GET_DB()
    const post = await db.collection(POST_COLLECTION_NAME).findOne({ slug, _destroy: false })
    return post
  } catch (error) {
    throw error
  }
}

export const postModel = {
  POST_COLLECTION_NAME,
  POST_COLLECTION_SCHEMA,
  createNew,
  getDetails,
  getAll,
  update,
  findOneByTitle,
  deleteOneById,
  findOneById,
  getAllByCategoryId,
  getAllByTagId,
  findOneBySlug
}
