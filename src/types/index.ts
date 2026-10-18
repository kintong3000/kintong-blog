export interface Frontmatter {
  title: string
  date?: string
  draft?: boolean
  type?: string
  redirect?: string
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
