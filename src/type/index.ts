export type PostData = {
  title: string
  slug: string
  description: string
  categoryId: string
  tags: string[]
  content: string
}

export enum ETYPESDESTROY {
  IS_DESTROY = 'isDestroy'
}

export enum ETYPESFROM {
  CMS = 'cms',
  WEB = 'web'
}
