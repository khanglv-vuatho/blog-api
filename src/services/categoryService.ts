import { TYPESFROM } from '@/constants'
import { categoryModel } from '@/models/categoryModel'
import { tagModel } from '@/models/tagModel'
import { createSlug } from '@/utils/createTag'

const createNew = async (reqBody: { title: string; tags: string[] | [] }) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const newPost = {
      ...reqBody,
      slug: createSlug(reqBody.title)
    }

    const exitsCategory = await categoryModel.findOneByTitle(newPost.title)

    if (exitsCategory) {
      throw Error('Category already exists')
    }

    const createdPost = await categoryModel.createNew(newPost)

    // const getNewPost = await categoryModel.findOneById(createdPost.insertedId)

    return createdPost
  } catch (error) {
    throw error
  }
}

const getDetails = async (categoryId: string) => {
  try {
    const getDetails = await categoryModel.getDetails(categoryId)

    return getDetails
  } catch (error) {
    throw error
  }
}

const getAll = async (type: string) => {
  try {
    const getAllCategory = await categoryModel.getAll(type)

    // Hàm chuyển đổi dữ liệu

    if (type === TYPESFROM.CMS) {
      return getAllCategory
    }

    const transformData = (data: any) => {
      return data.map((item: any) => {
        let newItem: any = {
          _id: item._id,
          title: item.title,
          url: `/${item.slug}`
        }

        if (item.tags && item.tags.length > 0) {
          newItem.children = item.tags.map((tag: any) => ({
            _id: tag._id,
            title: tag.title,
            url: `/${item.slug}/${tag.slug}`
          }))
        }

        return newItem
      })
    }

    const transformedData = transformData(getAllCategory)

    return transformedData
  } catch (error) {
    throw error
  }
}

const update = async (categoryId: string, data: any) => {
  try {
    const updateData = {
      ...data,
      updateAt: Date.now()
    }

    if (data.hasOwnProperty('title')) {
      updateData.slug = createSlug(data.title)
    }

    const updateCategory = await categoryModel.update(categoryId, updateData)
    return updateCategory
  } catch (error) {
    throw error
  }
}

const pushTagId = async (categoryId: string, tagId: string) => {
  try {
    const result = await categoryModel.pushTagId(categoryId, tagId)
    return result
  } catch (error) {
    throw error
  }
}

const deleteOneById = async (categoryId: string) => {
  try {
    const exitsCategory = await categoryModel.findOneById(categoryId)

    if (!exitsCategory) {
      throw Error('Category not found')
    }

    const result = await categoryModel.deleteOneById(categoryId)

    await tagModel.deleteManyTags(exitsCategory.tags.map((tag: any) => tag._id.toString()))

    return result
  } catch (error) {
    throw error
  }
}

export const categoryService = {
  createNew,
  getDetails,
  getAll,
  update,
  pushTagId,
  deleteOneById
}
