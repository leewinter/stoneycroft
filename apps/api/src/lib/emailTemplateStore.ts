import fs from 'node:fs'
import path from 'node:path'
import { env } from '../config/env'

export type EmailTemplate = {
  subject: string
  heading: string
  body: string
  buttonText: string
  footer: string
}

const filePath = path.join(env.dataDir, 'email-template.json')

function ensureDir() {
  fs.mkdirSync(env.dataDir, { recursive: true })
}

export const defaultEmailTemplate: EmailTemplate = {
  subject: 'Your magic sign-in link',
  heading: 'Sign in to Stoneycroft',
  body:
    'Use the button below to sign in. This link expires in about 15 minutes and can only be used once.',
  buttonText: 'Sign in',
  footer: "If the button doesn't work, copy and paste this link into your browser:"
}

export function readEmailTemplate(): EmailTemplate {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8')
    const parsed = JSON.parse(raw) as Partial<EmailTemplate> | null
    return {
      subject: parsed?.subject ?? defaultEmailTemplate.subject,
      heading: parsed?.heading ?? defaultEmailTemplate.heading,
      body: parsed?.body ?? defaultEmailTemplate.body,
      buttonText: parsed?.buttonText ?? defaultEmailTemplate.buttonText,
      footer: parsed?.footer ?? defaultEmailTemplate.footer
    }
  } catch {
    return defaultEmailTemplate
  }
}

export function writeEmailTemplate(next: EmailTemplate) {
  ensureDir()
  const tempPath = `${filePath}.tmp`
  fs.writeFileSync(tempPath, JSON.stringify(next, null, 2), 'utf-8')
  fs.renameSync(tempPath, filePath)
}
