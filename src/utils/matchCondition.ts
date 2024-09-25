import { TYPESFROM } from '@/constants'
import { ObjectId } from 'mongodb'

const matchCondition = (type: string) => {
  if (type === undefined) return {}
  return type === TYPESFROM.CMS ? {} : { _destroy: false }
}

const handleConvertObjectId = (postId: string) => {
  return new ObjectId(postId)
}

export { handleConvertObjectId, matchCondition }
