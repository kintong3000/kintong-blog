export interface Frontmatter {
  title: string
  date?: string
  draft?: boolean
  type?: string
  redirect?: string
  lang?: string
  duration?: string
  recording?: string
  upcoming?: boolean
  place?: string
  tags?: string[]
}

export interface Post {
  id: number
  title: string
  date: string
  urlName:string
  tags?: string[]
  path: string
}
