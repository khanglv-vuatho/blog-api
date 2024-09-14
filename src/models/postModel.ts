import Joi from 'joi'

import { ObjectId } from 'mongodb'
import { GET_DB } from '@/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '@/utils/validators'
import { tagModel } from './tagModel'
import { categoryModel } from './categoryModel'
import { PostData } from '@/type'
import { matchCondition } from '@/utils/matchCondition'
import { normalizeKeyword } from '@/utils/normalKeyword'

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
  _destroy: Joi.boolean().default(false),
  popular: Joi.boolean().default(false),
  vietnameseTitle: Joi.string().max(100).allow('').optional()
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

    // Add vietnameseTitle
    validData.vietnameseTitle = normalizeKeyword(validData.title)

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

const getAll = async (type: string, page: number = 1, limit: number = 7) => {
  try {
    const db = await GET_DB()
    console.log({ page })

    const skip = (page - 1) * limit
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
    const posts = await db
      .collection(POST_COLLECTION_NAME)
      .aggregate([{ $match: matchCondition(type) }, ...pipeline])
      .skip(skip)
      .limit(limit)
      .toArray()

    const totalCount = await db.collection(POST_COLLECTION_NAME).countDocuments(matchCondition(type))
    const totalPages = Math.ceil(totalCount / limit)

    return {
      data: posts,
      meta: {
        currentPage: page,
        totalPages,
        totalCount,
        limit
      }
    }
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

    //update now
    const vietnameseTitle = normalizeKeyword(data?.title || '')

    const dataToUpdate = { ...data, vietnameseTitle }

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

    const updatePost = await db
      .collection(POST_COLLECTION_NAME)
      .findOneAndUpdate({ _id: new ObjectId(postId) }, { $set: dataToUpdate }, { returnDocument: 'after' })

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

const getPopular = async () => {
  try {
    const db = await GET_DB()
    const post = await db.collection(POST_COLLECTION_NAME).find({ popular: true }).toArray()
    return post
  } catch (error) {
    throw error
  }
}

const searchPost = async (keyword: string, page: number = 1, limit: number = 10) => {
  try {
    const db = await GET_DB()
    const normalizedKeyword = keyword.trim().toLowerCase()

    const skip = (page - 1) * limit

    const searchQuery = {
      $or: [
        { title: { $regex: normalizedKeyword, $options: 'i' } },
        { description: { $regex: normalizedKeyword, $options: 'i' } },
        { vietnameseTitle: { $regex: normalizedKeyword, $options: 'i' } },
        { 'category.title': { $regex: normalizedKeyword, $options: 'i' } },
        { 'category.vietnameseTitle': { $regex: normalizedKeyword, $options: 'i' } },
        { 'tags.title': { $regex: normalizedKeyword, $options: 'i' } },
        { 'tags.vietnameseTitle': { $regex: normalizedKeyword, $options: 'i' } }
      ],
      _destroy: false
    }

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
      },
      {
        $match: searchQuery
      },
      {
        $sort: { views: -1 }
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      }
    ]

    const posts = await db.collection(POST_COLLECTION_NAME).aggregate(pipeline).toArray()

    const totalCount = await db.collection(POST_COLLECTION_NAME).countDocuments(searchQuery)

    const totalPages = Math.ceil(totalCount / limit)

    return {
      posts,
      meta: {
        currentPage: page,
        totalPages,
        totalCount,
        limit
      }
    }
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
  findOneBySlug,
  getPopular,
  searchPost
}
