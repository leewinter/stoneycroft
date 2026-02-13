import type { Hono } from 'hono'
import { readHomeContent, writeHomeContent } from '../lib/homeStore'

export function registerHomeRoutes(app: Hono) {
  app.get('/api/home/public', (c) => {
    return c.json({ ok: true, content: readHomeContent() })
  })

  app.get('/api/home', (c) => {
    return c.json({ ok: true, content: readHomeContent() })
  })

  app.post('/api/home', async (c) => {
    const body = await c.req.json().catch(() => null)
    const headline = body?.headline?.toString().trim() ?? ''
    const tagline = body?.tagline?.toString().trim() ?? ''
    const blurb = body?.blurb?.toString().trim() ?? ''
    writeHomeContent({ headline, tagline, blurb })
    return c.json({ ok: true })
  })
}
