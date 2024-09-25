import { ObjectId } from 'mongodb'

export type PostData = {
  title: string
  slug: string
  description: string
  categoryId: string
  tags: string[]
  content: string
}

export type TUser = {
  given_name: string
  email: string
  avatar: string
  createAt: Date
  updateAt: Date | null
  bookmarked: ObjectId[]
  history: ObjectId[]
}
