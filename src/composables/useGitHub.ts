import { ref } from 'vue'

export interface GitHubFile {
  name: string
  path: string
  type: 'file' | 'dir'
  size?: number
  download_url?: string
  html_url?: string
}

export interface GitHubRepoInfo {
  name: string
  description: string
  html_url: string
  default_branch: string
}

export function useGitHub() {
  const repoOwner = ref('kintong3000')
  const repoName = ref('kintong3000-backend')
  const baseUrl = 'https://api.github.com'

  const fetchRepoInfo = async (): Promise<GitHubRepoInfo> => {
    const response = await fetch(`${baseUrl}/repos/${repoOwner.value}/${repoName.value}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch repo info: ${response.statusText}`)
    }
    return response.json()
  }

  const fetchRepoContents = async (path: string = ''): Promise<GitHubFile[]> => {
    const response = await fetch(`${baseUrl}/repos/${repoOwner.value}/${repoName.value}/contents/${path}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch contents: ${response.statusText}`)
    }
    return response.json()
  }

  const fetchFileContent = async (path: string): Promise<string> => {
    const response = await fetch(`${baseUrl}/repos/${repoOwner.value}/${repoName.value}/contents/${path}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`)
    }
    const fileData = await response.json()
    
    // GitHub API returns content as base64 encoded
    if (fileData.content && fileData.encoding === 'base64') {
      return atob(fileData.content)
    }
    
    throw new Error('Unexpected file content format')
  }

  const fetchRawFile = async (path: string): Promise<string> => {
    const response = await fetch(`https://raw.githubusercontent.com/${repoOwner.value}/${repoName.value}/main/${path}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch raw file: ${response.statusText}`)
    }
    return response.text()
  }

  return {
    repoOwner,
    repoName,
    fetchRepoInfo,
    fetchRepoContents,
    fetchFileContent,
    fetchRawFile
  }
}