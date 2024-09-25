import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '@/utils/validators'
import { GET_DB } from '@/config/mongodb'
import { TUser } from '@/type'
import { ObjectId, UpdateFilter } from 'mongodb'
import { BOOKMARK_ACTION } from '@/utils/constants'
import { handleConvertObjectId } from '@/utils/matchCondition'

const USER_COLLECTION_NAME = 'users'
const USER_COLLECTION_SCHEMA = Joi.object({
  given_name: Joi.string().required().max(50).strict(),
  email: Joi.string().required().max(50).strict(),
  avatar: Joi.string().required().max(500).strict(),
  createAt: Joi.date()
    .timestamp('javascript')
    .default(() => new Date()),
  updateAt: Joi.date().timestamp('javascript').default(null),
  bookmarked: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).required()).default([]),
  history: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).required()).default([])
})

const INVALID_UPDATE_FIELDS = ['email', 'createAt']

const validateBeforeCreate = async (data: TUser) => {
  return USER_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false, allowUnknown: true })
}

const createNewUser = async (data: TUser) => {
  try {
    const db = await GET_DB()
    const validData = await validateBeforeCreate(data)
    const user = await db.collection(USER_COLLECTION_NAME).insertOne(validData)
    return user
  } catch (error: any) {
    throw new Error(error)
  }
}

const updateUser = async (userId: string, data: TUser) => {
  try {
    const db = await GET_DB()
    Object.keys(data).forEach((fields) => {
      if (INVALID_UPDATE_FIELDS.includes(fields)) {
        delete data[fields as keyof TUser]
      }
    })
    const user = await db.collection(USER_COLLECTION_NAME).updateOne({ _id: new ObjectId(userId) }, { $set: data })
    return user
  } catch (error: any) {
    throw new Error(error)
  }
}

const findOneByEmail = async (email: string) => {
  try {
    const db = await GET_DB()
    const user = await db.collection(USER_COLLECTION_NAME).findOne({ email })
    return user
  } catch (error: any) {
    throw new Error(error)
  }
}

const handleBookmark = async (userId: string, postId: string, action: (typeof BOOKMARK_ACTION)[keyof typeof BOOKMARK_ACTION]) => {
  try {
    const db = await GET_DB()
    let user

    const updateAction =
      action === BOOKMARK_ACTION.ADD
        ? { $addToSet: { bookmarked: handleConvertObjectId(postId) } } // Use ObjectId for postId
        : { $pull: { bookmarked: handleConvertObjectId(postId) } }

    // Assuming USER_COLLECTION_NAME contains TUser type, adjust collection type accordingly
    user = await db.collection<TUser>(USER_COLLECTION_NAME).updateOne({ _id: handleConvertObjectId(userId) }, updateAction)

    return user
  } catch (error: any) {
    throw new Error(error)
  }
}
const handleHistory = async (userId: string, postId: string) => {
  try {
    const db = await GET_DB()

    // Filter to find the user

    // First delete if exists, then add to the beginning of the array
    const updateAction: UpdateFilter<TUser> = {
      $pull: { history: handleConvertObjectId(postId) }, // Delete if exists
      $push: {
        history: {
          $each: [handleConvertObjectId(postId)], // Add to the beginning of the array
          $position: 0
        }
      }
    }

    const user = await db.collection<TUser>(USER_COLLECTION_NAME).updateOne({ _id: handleConvertObjectId(userId) }, updateAction)
    return user
  } catch (error: any) {
    throw new Error(error)
  }
}

export const userModel = {
  USER_COLLECTION_NAME,
  USER_COLLECTION_SCHEMA,
  createNewUser,
  updateUser,
  findOneByEmail,
  handleBookmark,
  handleHistory
}
