import type { Hono } from 'hono'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { env } from '../config/env'
import { readHomeContent, writeHomeContent } from '../lib/homeStore'

type IncomingProject = {
  id?: string
  name?: string
  url?: string
  sourceUrl?: string
  image?: string
  description?: string
  labels?: string[]
  active?: boolean
}

export function registerHomeRoutes(app: Hono) {
  app.get('/api/home/public', (c) => {
    return c.json({ ok: true, content: readHomeContent() })
  })

  app.post('/api/home/upload', async (c) => {
    const body = await c.req.parseBody()
    const file = body?.file
    if (!(file instanceof File)) {
      return c.json({ ok: false, message: 'No file uploaded.' }, 400)
    }
    const ext = path.extname(file.name || '').toLowerCase()
    const safeExt = ext && ext.length <= 6 ? ext : ''
    const uploadsDir = path.join(env.dataDir, 'uploads')
    fs.mkdirSync(uploadsDir, { recursive: true })
    const filename = `${crypto.randomUUID()}${safeExt}`
    const filePath = path.join(uploadsDir, filename)
    const buffer = Buffer.from(await file.arrayBuffer())
    fs.writeFileSync(filePath, buffer)
    return c.json({ ok: true, url: `/uploads/${filename}` })
  })

  app.get('/api/home', (c) => {
    return c.json({ ok: true, content: readHomeContent() })
  })

  app.post('/api/home', async (c) => {
    const body = await c.req.json().catch(() => null)
    const headline = body?.headline?.toString().trim() ?? ''
    const tagline = body?.tagline?.toString().trim() ?? ''
    const blurb = body?.blurb?.toString().trim() ?? ''
    const projects = Array.isArray(body?.projects)
      ? (body.projects as IncomingProject[]).map((project) => ({
          id: project?.id?.toString() ?? '',
          name: project?.name?.toString().trim() ?? '',
          url: project?.url?.toString().trim() ?? '',
          sourceUrl: project?.sourceUrl?.toString().trim() ?? '',
          image: project?.image?.toString().trim() ?? '',
          description: project?.description?.toString().trim() ?? '',
          labels: Array.isArray(project?.labels)
            ? project.labels.map((label) => label?.toString().trim()).filter(Boolean)
            : [],
          active: Boolean(project?.active ?? true)
        }))
      : []
    writeHomeContent({ headline, tagline, blurb, projects })
    return c.json({ ok: true })
  })
}
