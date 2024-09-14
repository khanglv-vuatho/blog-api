import { TYPESFROM } from '@/constants'

export const matchCondition = (type: string) => {
  if (type === undefined) return {}
  return type === TYPESFROM.CMS ? {} : { _destroy: false }
}
