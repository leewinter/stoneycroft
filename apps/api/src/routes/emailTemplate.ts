import type { Hono } from 'hono'
import { readEmailTemplate, writeEmailTemplate } from '../lib/emailTemplateStore'

export function registerEmailTemplateRoutes(app: Hono) {
  app.get('/api/email-template', (c) => {
    return c.json({ ok: true, template: readEmailTemplate() })
  })

  app.post('/api/email-template', async (c) => {
    const body = await c.req.json().catch(() => null)
    const template = {
      subject: body?.subject?.toString().trim() ?? '',
      heading: body?.heading?.toString().trim() ?? '',
      body: body?.body?.toString().trim() ?? '',
      buttonText: body?.buttonText?.toString().trim() ?? '',
      footer: body?.footer?.toString().trim() ?? ''
    }
    writeEmailTemplate(template)
    return c.json({ ok: true })
  })
}
