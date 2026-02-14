import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { env } from '../config/env'

export type HomeProject = {
  id: string
  name: string
  url: string
  sourceUrl: string
  image: string
  description: string
  labels: string[]
  active: boolean
}

export type HomeContent = {
  headline: string
  tagline: string
  blurb: string
  projects: HomeProject[]
}

const filePath = path.join(env.dataDir, 'home.json')

function ensureDir() {
  fs.mkdirSync(env.dataDir, { recursive: true })
}

const emptyContent: HomeContent = {
  headline: '',
  tagline: '',
  blurb: '',
  projects: []
}

function makeId() {
  return crypto.randomUUID()
}

function normalizeProjects(input: unknown): HomeProject[] {
  if (!Array.isArray(input)) return []
  return input.map((project) => {
    const item = (project ?? {}) as Partial<HomeProject>
    return {
      id: item.id ? item.id : makeId(),
      name: item.name ?? '',
      url: item.url ?? '',
      sourceUrl: item.sourceUrl ?? '',
      image: item.image ?? '',
      description: item.description ?? '',
      labels: Array.isArray(item.labels)
        ? item.labels.map((label) => String(label).trim()).filter(Boolean)
        : [],
      active: item.active ?? true
    }
  })
}

export function readHomeContent(): HomeContent {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8')
    const parsed = JSON.parse(raw) as Partial<HomeContent> | null
    return {
      headline: parsed?.headline ?? '',
      tagline: parsed?.tagline ?? '',
      blurb: parsed?.blurb ?? '',
      projects: normalizeProjects(parsed?.projects)
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
