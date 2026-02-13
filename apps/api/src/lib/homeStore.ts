import fs from 'node:fs'
import path from 'node:path'
import { env } from '../config/env'

export type HomeContent = {
  headline: string
  tagline: string
  blurb: string
}

const filePath = path.join(env.dataDir, 'home.json')

function ensureDir() {
  fs.mkdirSync(env.dataDir, { recursive: true })
}

const emptyContent: HomeContent = {
  headline: '',
  tagline: '',
  blurb: ''
}

export function readHomeContent(): HomeContent {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8')
    const parsed = JSON.parse(raw) as Partial<HomeContent> | null
    return {
      headline: parsed?.headline ?? '',
      tagline: parsed?.tagline ?? '',
      blurb: parsed?.blurb ?? ''
    }
  } catch {
    return emptyContent
  }
}

export function writeHomeContent(next: HomeContent) {
  ensureDir()
  const tempPath = `${filePath}.tmp`
  fs.writeFileSync(tempPath, JSON.stringify(next, null, 2), 'utf-8')
  fs.renameSync(tempPath, filePath)
}
