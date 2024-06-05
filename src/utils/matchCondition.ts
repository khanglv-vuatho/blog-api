import { TYPESDESTROY, TYPESFROM } from '@/constants'

export const matchCondition = (type: string) => {
  if (type === undefined) return {}
  return type === TYPESFROM.CMS ? {} : { _destroy: type === TYPESDESTROY.IS_DESTROY }
}
