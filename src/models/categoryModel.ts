import { GET_DB } from '@/config/mongodb'
import { matchCondition } from '@/utils/matchCondition'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '@/utils/validators'
import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { tagModel } from './tagModel'

const CATEGORY_COLLECTION_NAME = 'categorys'
const CATEGORY_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().max(50).strict(),
  tags: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),
  slug: Joi.string().required().max(50).strict(),
  _destroy: Joi.boolean().default(false),
  createAt: Joi.date()
    .timestamp('javascript')
    .default(() => new Date()),
  updateAt: Joi.date().timestamp('javascript').default(null)
})

const INVALID_UPDATE_FIELDS = ['_id', 'createAt']

const findOneByTitle = async (title: string) => {
  try {
    const db = await GET_DB()
    const category = await db.collection(CATEGORY_COLLECTION_NAME).findOne({ title })
    return category
  } catch (error: any) {
    throw new Error(error)
  }
}
const validateBeforeCreate = async (data: any) => {
  return await CATEGORY_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async ({ title, slug }: { title: string; slug: string }) => {
  try {
    const db = await GET_DB()
    const validData = await validateBeforeCreate({ title, slug })

    if (Array.isArray(validData.tags)) {
      validData.tags = validData.tags.map((tag: string) => new ObjectId(tag))
    }

    const createdCategory = await db.collection(CATEGORY_COLLECTION_NAME).insertOne(validData)

    return createdCategory
  } catch (error) {
    throw error
  }
}

const getDetails = async (categoryId: string) => {
  try {
    const db = await GET_DB()

    const getDetails = await db
      .collection(CATEGORY_COLLECTION_NAME)
      .aggregate([
        { $match: { _id: new ObjectId(categoryId) } },
        {
          $lookup: {
            from: tagModel.TAG_COLLECTION_NAME,
            localField: 'tags',
            foreignField: '_id',
            as: 'tags'
          }
        }
      ])
      .toArray()
    return getDetails
  } catch (error) {
    throw error
  }
}

const getAll = async (type: string) => {
  try {
    const db = await GET_DB()

    // Define the aggregation pipeline
    const pipeline = [
      {
        $lookup: {
          from: tagModel.TAG_COLLECTION_NAME,
          localField: 'tags',
          foreignField: '_id',
          as: 'tags'
        }
      }
    ]

    // Execute the aggregation pipeline
    const categories = await db
      .collection(CATEGORY_COLLECTION_NAME)
      .aggregate([{ $match: matchCondition(type) }, ...pipeline])
      .toArray()

    return categories
  } catch (error) {
    throw error
  }
}

const update = async (categoryId: string, data: any) => {
  try {
    Object.keys(data).forEach((fields) => {
      if (INVALID_UPDATE_FIELDS.includes(fields)) {
        delete data[fields]
      }
    })

    if (data.tags) {
      data.tags = data.tags.map((tag: string) => new ObjectId(tag))
    }

    const db = await GET_DB()
    const updateCategory = await db.collection(CATEGORY_COLLECTION_NAME).updateOne({ _id: new ObjectId(categoryId) }, { $set: data })

    return updateCategory
  } catch (error) {
    throw error
  }
}

const pushTagId = async (categoryId: string, tagId: string) => {
  try {
    const db = await GET_DB()
    const result = await db
      .collection(CATEGORY_COLLECTION_NAME)
      .findOneAndUpdate({ _id: new ObjectId(categoryId) }, { $push: { tags: new ObjectId(tagId) as any } }, { returnDocument: 'after' })
    return result
  } catch (error) {
    console.error('Error updating category with new tag:', error)
    throw error
  }
}

const deleteOneById = async (categoryId: string) => {
  try {
    const db = await GET_DB()
    const result = await db.collection(CATEGORY_COLLECTION_NAME).deleteOne({ _id: new ObjectId(categoryId) })
    return result
  } catch (error) {
    throw error
  }
}

const findOneById = async (categoryId: string) => {
  try {
    const db = await GET_DB()
    const category = await db.collection(CATEGORY_COLLECTION_NAME).findOne({ _id: new ObjectId(categoryId) })
    return category
  } catch (error) {
    throw error
  }
}

const findOneBySlug = async (slug: string) => {
  try {
    const db = await GET_DB()
    const category = await db.collection(CATEGORY_COLLECTION_NAME).findOne({ slug })
    return category
  } catch (error) {
    throw error
  }
}

export const categoryModel = {
  CATEGORY_COLLECTION_NAME,
  CATEGORY_COLLECTION_SCHEMA,
  createNew,
  findOneByTitle,
  getDetails,
  getAll,
  update,
  pushTagId,
  deleteOneById,
  findOneById,
  findOneBySlug
}
