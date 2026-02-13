import { Button, Input } from 'antd'
import { useEffect, useMemo, useState } from 'react'

type HomeContent = {
  headline: string
  tagline: string
  blurb: string
}

type Props = {
  showSave?: boolean
  saveLabel?: string
  requireDirty?: boolean
  onSaveWidget?: (config: HomeContent) => void
}

const emptyContent: HomeContent = {
  headline: '',
  tagline: '',
  blurb: ''
}

export default function HomeWidget({
  showSave,
  saveLabel = 'Add widget',
  requireDirty = true,
  onSaveWidget
}: Props) {
  const [content, setContent] = useState<HomeContent>(emptyContent)
  const [baseline, setBaseline] = useState<HomeContent>(emptyContent)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/home')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { ok?: boolean; content?: HomeContent } | null) => {
        const next = data?.content ?? emptyContent
        setContent(next)
        setBaseline(next)
      })
      .catch(() => setError('Failed to load home content.'))
      .finally(() => setIsLoading(false))
  }, [])

  const isDirty = useMemo(() => {
    return (
      baseline.headline !== content.headline ||
      baseline.tagline !== content.tagline ||
      baseline.blurb !== content.blurb
    )
  }, [baseline, content])

  const save = async () => {
    setIsSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/home', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content)
      })
      if (!res.ok) {
        setError('Failed to save home content.')
        return
      }
      setBaseline(content)
    } catch {
      setError('Failed to save home content.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="log-viewer home-widget">
      <div className="log-viewer__header">
        <div>
          <h3>Home content</h3>
          <span className="log-viewer__status">Public portfolio copy</span>
        </div>
        <div className="log-viewer__actions">
          {showSave && onSaveWidget && (
            <Button
              size="small"
              disabled={requireDirty ? !isDirty : false}
              onClick={() => {
                onSaveWidget(content)
                setBaseline(content)
              }}
            >
              {saveLabel}
            </Button>
          )}
          <Button size="small" onClick={save} disabled={isSaving || isLoading}>
            Save changes
          </Button>
        </div>
      </div>

      <div className="widget-controls">
        <Input
          placeholder="Headline"
          value={content.headline}
          onChange={(event) => setContent((prev) => ({ ...prev, headline: event.target.value }))}
        />
        <Input
          placeholder="Tagline"
          value={content.tagline}
          onChange={(event) => setContent((prev) => ({ ...prev, tagline: event.target.value }))}
        />
        <Input.TextArea
          placeholder="Short blurb for the portfolio home"
          value={content.blurb}
          rows={4}
          onChange={(event) => setContent((prev) => ({ ...prev, blurb: event.target.value }))}
        />
      </div>

      {isLoading && <p className="log-viewer__empty">Loading home content...</p>}
      {error && <p className="log-viewer__empty">{error}</p>}
    </div>
  )
}
