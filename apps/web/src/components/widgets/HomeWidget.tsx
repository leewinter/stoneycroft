import { Button, Input, Switch } from 'antd'
import { useEffect, useMemo, useRef, useState } from 'react'

type HomeProject = {
  id: string
  name: string
  url: string
  image: string
  description: string
  active: boolean
}

type HomeContent = {
  headline: string
  tagline: string
  blurb: string
  projects: HomeProject[]
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
  blurb: '',
  projects: []
}

function makeId() {
  return globalThis.crypto?.randomUUID?.() ?? `proj-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

const emptyProject = (): HomeProject => ({
  id: makeId(),
  name: '',
  url: '',
  image: '',
  description: '',
  active: true
})

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
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    fetch('/api/home')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { ok?: boolean; content?: HomeContent } | null) => {
        const next = data?.content ?? emptyContent
        const normalized = {
          ...emptyContent,
          ...next,
          projects: Array.isArray(next.projects) ? next.projects : []
        }
        setContent(normalized)
        setBaseline(normalized)
      })
      .catch(() => setError('Failed to load home content.'))
      .finally(() => setIsLoading(false))
  }, [])

  const isDirty = useMemo(() => {
    return (
      baseline.headline !== content.headline ||
      baseline.tagline !== content.tagline ||
      baseline.blurb !== content.blurb ||
      JSON.stringify(baseline.projects) !== JSON.stringify(content.projects)
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

      <div className="home-projects-editor">
        <div className="home-projects-header">
          <h4>Projects</h4>
          <Button size="small" onClick={() => setContent((prev) => ({
            ...prev,
            projects: [...prev.projects, emptyProject()]
          }))}>
            Add project
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={async (event) => {
            const target = event.target
            const file = target.files?.[0]
            const projectId = target.getAttribute('data-project')
            target.value = ''
            if (!file || !projectId) return
            setUploadingId(projectId)
            setError(null)
            try {
              const form = new FormData()
              form.append('file', file)
              const res = await fetch('/api/home/upload', {
                method: 'POST',
                body: form
              })
              const payload = (await res.json().catch(() => null)) as
                | { ok?: boolean; url?: string; message?: string }
                | null
              if (!res.ok || !payload?.ok || !payload.url) {
                setError(payload?.message ?? 'Failed to upload image.')
                return
              }
              setContent((prev) => ({
                ...prev,
                projects: prev.projects.map((item) =>
                  item.id === projectId ? { ...item, image: payload.url ?? '' } : item
                )
              }))
            } catch {
              setError('Failed to upload image.')
            } finally {
              setUploadingId(null)
            }
          }}
        />
        {content.projects.length === 0 && (
          <p className="log-viewer__empty">No projects yet.</p>
        )}
        <div className="home-projects-grid home-projects-grid--fixed">
          {content.projects.map((project, index) => (
            <div key={project.id} className="home-project-card">
            <div className="home-project-card__header">
              <span className="home-project-card__title">Project {index + 1}</span>
              <div className="home-project-card__actions">
                <label className="widget-toggle">
                  <Switch
                    checked={project.active}
                    onChange={(checked) =>
                      setContent((prev) => ({
                        ...prev,
                        projects: prev.projects.map((item) =>
                          item.id === project.id ? { ...item, active: checked } : item
                        )
                      }))
                    }
                  />
                  <span>Active</span>
                </label>
                <Button
                  size="small"
                  onClick={() => {
                    if (!fileInputRef.current) return
                    fileInputRef.current.setAttribute('data-project', project.id)
                    fileInputRef.current.click()
                  }}
                  disabled={uploadingId === project.id}
                >
                  {project.image ? 'Replace image' : 'Upload image'}
                </Button>
                {project.image && (
                  <Button
                    size="small"
                    onClick={() =>
                      setContent((prev) => ({
                        ...prev,
                        projects: prev.projects.map((item) =>
                          item.id === project.id ? { ...item, image: '' } : item
                        )
                      }))
                    }
                  >
                    Remove image
                  </Button>
                )}
                <Button
                  size="small"
                  danger
                  onClick={() =>
                    setContent((prev) => ({
                      ...prev,
                      projects: prev.projects.filter((item) => item.id !== project.id)
                    }))
                  }
                >
                  Remove
                </Button>
              </div>
            </div>
            {project.image && (
              <div className="home-project-preview">
                <img src={project.image} alt={project.name || 'Project image'} />
              </div>
            )}
            <div className="widget-controls home-project-card__body">
              <Input
                placeholder="Project name"
                value={project.name}
                onChange={(event) =>
                  setContent((prev) => ({
                    ...prev,
                    projects: prev.projects.map((item) =>
                      item.id === project.id ? { ...item, name: event.target.value } : item
                    )
                  }))
                }
              />
              <Input
                placeholder="Project URL"
                value={project.url}
                onChange={(event) =>
                  setContent((prev) => ({
                    ...prev,
                    projects: prev.projects.map((item) =>
                      item.id === project.id ? { ...item, url: event.target.value } : item
                    )
                  }))
                }
              />
              <Input.TextArea
                placeholder="Project description"
                value={project.description}
                rows={3}
                onChange={(event) =>
                  setContent((prev) => ({
                    ...prev,
                    projects: prev.projects.map((item) =>
                      item.id === project.id ? { ...item, description: event.target.value } : item
                    )
                  }))
                }
              />
            </div>
            </div>
          ))}
        </div>
      </div>

      {isLoading && <p className="log-viewer__empty">Loading home content...</p>}
      {error && <p className="log-viewer__empty">{error}</p>}
    </div>
  )
}
