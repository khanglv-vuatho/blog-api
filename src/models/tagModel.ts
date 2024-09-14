import { GET_DB } from '@/config/mongodb'
import { TYPESDESTROY, TYPESFROM } from '@/constants'
import { matchCondition } from '@/utils/matchCondition'
import { normalizeKeyword } from '@/utils/normalKeyword'
import Joi from 'joi'
import { ObjectId } from 'mongodb'

const TAG_COLLECTION_NAME = 'tags'
const TAG_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().max(50).strict(),
  slug: Joi.string().required().max(50).strict(),
  vietnameseTitle: Joi.string().max(100).allow('').optional(),
  _destroy: Joi.boolean().default(false)
})

const INVALID_UPDATE_FIELDS = ['_id', 'updateAt']

interface TagData {
  title: string
  slug: string
  vietnameseTitle: string
}

const validateBeforeCreate = async (data: TagData) => {
  return await TAG_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const findOneByTitle = async (title: string) => {
  try {
    const db = await GET_DB()
    const tag = await db.collection(TAG_COLLECTION_NAME).findOne({ title })
    return tag
  } catch (error: any) {
    throw new Error(error)
  }
}

const createNew = async ({ title, slug }: { title: string; slug: string }) => {
  try {
    const db = await GET_DB()
    const vietnameseTitle = normalizeKeyword(title)
    const validData = await validateBeforeCreate({ title, slug, vietnameseTitle })
    const createTag = await db.collection(TAG_COLLECTION_NAME).insertOne(validData)

    return createTag
  } catch (error: any) {
    throw new Error(error)
  }
}

const getAll = async (type: string, page: number = 1, limit: number = 7) => {
  try {
    const db = await GET_DB()
    const skip = (page - 1) * limit
    const tags = await db.collection(TAG_COLLECTION_NAME).find(matchCondition(type)).skip(skip).limit(limit).toArray()
    const totalCount = await db.collection(TAG_COLLECTION_NAME).countDocuments(matchCondition(type))
    const totalPages = Math.ceil(totalCount / limit)

    return {
      data: tags,
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

const update = async (tagId: string, data: any) => {
  try {
    Object.keys(data).forEach((fields) => {
      if (INVALID_UPDATE_FIELDS.includes(fields)) {
        delete data[fields]
      }
    })
    const vietnameseTitle = normalizeKeyword(data.title)
    const dataToUpdate = { ...data, vietnameseTitle }
    const db = await GET_DB()

    const tag = await db.collection(TAG_COLLECTION_NAME).findOneAndUpdate({ _id: new ObjectId(tagId) }, { $set: dataToUpdate }, { returnDocument: 'after' })
    return tag
  } catch (error: any) {
    throw new Error(error)
  }
}

const deleteTag = async (tagId: string) => {
  try {
    const db = await GET_DB()
    const tag = await db.collection(TAG_COLLECTION_NAME).deleteOne({ _id: new ObjectId(tagId) })
    return tag
  } catch (error: any) {
    throw new Error(error)
  }
}

const deleteManyTags = async (tagIds: string[]) => {
  try {
    const db = await GET_DB()
    const tag = await db.collection(TAG_COLLECTION_NAME).deleteMany({ _id: { $in: tagIds.map((tagId) => new ObjectId(tagId)) } })
    return tag
  } catch (error: any) {
    throw new Error(error)
  }
}

const findOneById = async (tagId: string) => {
  try {
    const db = await GET_DB()
    const tag = await db.collection(TAG_COLLECTION_NAME).findOne({ _id: new ObjectId(tagId) })
    return tag
  } catch (error) {
    throw error
  }
}

const getDetails = async (tagId: string) => {
  try {
    const getDetails = await tagModel.findOneById(tagId)
    return getDetails
  } catch (error) {
    throw error
  }
}

const findOneBySlug = async (slug: string) => {
  try {
    const db = await GET_DB()
    const tag = await db.collection(TAG_COLLECTION_NAME).findOne({ slug })
    return tag
  } catch (error) {
    throw error
  }
}

export const tagModel = {
  TAG_COLLECTION_NAME,
  TAG_COLLECTION_SCHEMA,
  createNew,
  getAll,
  findOneById,
  update,
  findOneByTitle,
  deleteTag,
  deleteManyTags,
  getDetails,
  findOneBySlug
}
