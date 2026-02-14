import { Button, Input } from 'antd'
import { useEffect, useMemo, useState } from 'react'

type EmailTemplate = {
  subject: string
  heading: string
  body: string
  buttonText: string
  footer: string
}

const emptyTemplate: EmailTemplate = {
  subject: '',
  heading: '',
  body: '',
  buttonText: '',
  footer: ''
}

export default function EmailTemplateWidget() {
  const [template, setTemplate] = useState<EmailTemplate>(emptyTemplate)
  const [baseline, setBaseline] = useState<EmailTemplate>(emptyTemplate)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/email-template')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { ok?: boolean; template?: EmailTemplate } | null) => {
        const next = data?.template ?? emptyTemplate
        setTemplate(next)
        setBaseline(next)
      })
      .catch(() => setError('Failed to load email template.'))
      .finally(() => setIsLoading(false))
  }, [])

  const isDirty = useMemo(() => {
    return (
      baseline.subject !== template.subject ||
      baseline.heading !== template.heading ||
      baseline.body !== template.body ||
      baseline.buttonText !== template.buttonText ||
      baseline.footer !== template.footer
    )
  }, [baseline, template])

  const save = async () => {
    setIsSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/email-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template)
      })
      if (!res.ok) {
        setError('Failed to save email template.')
        return
      }
      setBaseline(template)
    } catch {
      setError('Failed to save email template.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="log-viewer email-template-widget">
      <div className="log-viewer__header">
        <div>
          <h3>Email template</h3>
          <span className="log-viewer__status">Magic link email content</span>
        </div>
        <div className="log-viewer__actions">
          <Button size="small" onClick={save} disabled={!isDirty || isSaving || isLoading}>
            Save changes
          </Button>
        </div>
      </div>

      <div className="widget-controls">
        <Input
          placeholder="Subject"
          value={template.subject}
          onChange={(event) => setTemplate((prev) => ({ ...prev, subject: event.target.value }))}
        />
        <Input
          placeholder="Heading"
          value={template.heading}
          onChange={(event) => setTemplate((prev) => ({ ...prev, heading: event.target.value }))}
        />
        <Input.TextArea
          placeholder="Body"
          value={template.body}
          rows={3}
          onChange={(event) => setTemplate((prev) => ({ ...prev, body: event.target.value }))}
        />
        <Input
          placeholder="Button text"
          value={template.buttonText}
          onChange={(event) =>
            setTemplate((prev) => ({ ...prev, buttonText: event.target.value }))
          }
        />
        <Input.TextArea
          placeholder="Footer"
          value={template.footer}
          rows={2}
          onChange={(event) => setTemplate((prev) => ({ ...prev, footer: event.target.value }))}
        />
      </div>

      {isLoading && <p className="log-viewer__empty">Loading template...</p>}
      {error && <p className="log-viewer__empty">{error}</p>}
    </div>
  )
}
