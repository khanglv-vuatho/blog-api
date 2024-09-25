import { TYPESFROM } from '@/constants'
import { categoryModel } from '@/models/categoryModel'
import { postModel } from '@/models/postModel'
import { tagModel } from '@/models/tagModel'
import { PostData } from '@/type'
import { createSlug } from '@/utils/createTag'
import { deleteFile, updateFile, uploadFile } from '@/worker'
import { v4 as uuidv4 } from 'uuid'

const createNew = async (reqBody: PostData, file: any) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const exitsPost = await postModel.findOneByTitle(reqBody.title)
    const uuid = uuidv4()
    const url = `${process.env.WORKER_API_URL}/${uuid}`
    const response = uploadFile(url, file.buffer)

    if (exitsPost || !response) {
      throw Error('Post already exists')
    }

    const newPost = {
      ...reqBody,
      slug: createSlug(reqBody.title),
      views: 1,
      thumbnail: url
    }

    if (!file) {
      throw Error('Please select an image')
    }

    const createdPost = await postModel.createNew(newPost)

    return createdPost
  } catch (error) {
    throw error
  }
}

const getDetails = async (postId: string) => {
  try {
    const getDetails = await postModel.getDetails(postId)
    await postService.update(postId, { views: Number(getDetails?.views + 1) })
    return getDetails
  } catch (error) {
    throw error
  }
}

const getAll = async (type: string, page: number, limit: number) => {
  try {
    const getAllPost = await postModel.getAll(type, Number(page), Number(limit))

    return getAllPost
  } catch (error) {
    throw error
  }
}

const update = async (postId: string, data: any, file?: any) => {
  try {
    const updateData = {
      ...data,
      updateAt: Date.now()
    }

    if (updateData?.title) {
      console.log(updateData?.title)
      updateData.slug = createSlug(updateData.title)
    }

    const updatePost = await postModel.update(postId, updateData)

    if (file && file.buffer) {
      const exitsPost = await postModel.findOneById(postId)

      const url = exitsPost?.thumbnail
      const response = updateFile(url, file.buffer)

      if (!response) {
        throw Error('Please select an image')
      }

      updateData.thumbnail = url
    }

    return updatePost
  } catch (error) {
    throw error
  }
}

const deleteOneById = async (postId: string) => {
  try {
    const exitsPost = await postModel.findOneById(postId)

    if (!exitsPost) {
      throw Error('Post not found')
    }

    const result = await postModel.deleteOneById(postId)

    if (result.deletedCount > 0) {
      await deleteFile(exitsPost?.thumbnail)
    }

    return result
  } catch (error) {
    throw error
  }
}

const getAllTagAndCategory = async () => {
  try {
    let result
    const getAllTag = await tagModel.getAll(TYPESFROM.WEB)
    const getAllCategory = await categoryModel.getAll(TYPESFROM.WEB)

    result = {
      tags: getAllTag,
      categories: getAllCategory
    }

    return result
  } catch (error) {
    throw error
  }
}

const findBySlugCategory = async (slug: string) => {
  try {
    const category = await categoryModel.findOneBySlug(slug)

    const posts = await postModel.getAllByCategoryId(category?._id as any)
    return {
      category,
      posts
    }
  } catch (error) {
    throw error
  }
}

const findBySlugTag = async ({ slugTag, slugCategory }: { slugTag: string; slugCategory: string }) => {
  try {
    const tag = await tagModel.findOneBySlug(slugTag)
    const category = await categoryModel.findOneBySlug(slugCategory)
    const posts = await postModel.getAllByTagId(tag?._id as any)
    return {
      category,
      tag,
      posts
    }
  } catch (error) {
    throw error
  }
}

const getDetailsBySlug = async (slug: string) => {
  try {
    const post = await postModel.findOneBySlug(slug)
    await postService.update(post?._id as any, { views: Number(post?.views + 1) })

    return post
  } catch (error) {
    throw error
  }
}

const getPopular = async () => {
  try {
    const getPopular = await postModel.getPopular()
    return getPopular
  } catch (error) {
    throw error
  }
}

// Get all post by slug tag
const getAllBySlugTag = async (slugTag: string, page: number, limit: number) => {
  try {
    const tag = await tagModel.findOneBySlug(slugTag)
    const posts = await postModel.getAllByTagId(tag?._id as any, page, limit)
    return posts
  } catch (error) {
    throw error
  }
}

const searchPost = async (keyword: string, page: number, limit: number) => {
  try {
    const search = await postModel.searchPost(keyword, page, limit)
    return search
  } catch (error) {
    throw error
  }
}

export const postService = {
  createNew,
  getDetails,
  getAll,
  update,
  deleteOneById,
  getAllTagAndCategory,
  findBySlugCategory,
  findBySlugTag,
  getDetailsBySlug,
  getPopular,
  getAllBySlugTag,
  searchPost
}
