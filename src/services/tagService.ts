import { categoryModel } from '@/models/categoryModel'
import { postModel } from '@/models/postModel'
import { tagModel } from '@/models/tagModel'
import { createSlug } from '@/utils/createTag'
import { Request } from 'express'

const createNew = async (reqBody: { title: string }) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const newPost = {
      ...reqBody,
      slug: createSlug(reqBody.title)
    }
    const exitsTag = await tagModel.findOneByTitle(newPost.title)
    if (exitsTag) {
      throw Error('Tag already exists')
    }

    const createdPost = await tagModel.createNew(newPost)
    return createdPost
  } catch (error) {
    throw error
  }
}

const getAll = async (type: string) => {
  try {
    const getAllTag = await tagModel.getAll(type)

    return getAllTag
  } catch (error) {
    throw error
  }
}

const update = async (tagId: string, data: any) => {
  try {
    const updateData = {
      ...data,
      updateAt: Date.now()
    }

    if (data.hasOwnProperty('title')) {
      updateData.slug = createSlug(data.title)

      const exitsTag = await tagModel.findOneByTitle(data.title)

      if (exitsTag) {
        throw Error('Tag already exists')
      }
    }

    const updateTag = await tagModel.update(tagId, updateData)
    return updateTag
  } catch (error) {
    throw error
  }
}

const deleteTag = async (tagId: string) => {
  try {
    const exitsTag = await tagModel.findOneById(tagId)

    if (!exitsTag) {
      throw Error('Tag not found')
    }

    const deleteTag = await tagModel.deleteTag(tagId)
    return deleteTag
  } catch (error) {
    throw error
  }
}

const getDetails = async (tagId: string) => {
  try {
    const getDetails = await tagModel.getDetails(tagId)
    return getDetails
  } catch (error) {
    throw error
  }
}

export const tagService = {
  createNew,
  getAll,
  update,
  deleteTag,
  getDetails
}
