import { Button } from 'antd'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

type HomeContent = {
  headline: string
  tagline: string
  blurb: string
}

const fallbackContent: HomeContent = {
  headline: 'Keep your ops view focused, fast, and human.',
  tagline: 'Stoneycroft',
  blurb:
    'Stoneycroft gives your team a calm control room for logs, users, and the essentials. Sign in with a magic link to get started.'
}

export default function HomePage() {
  const [content, setContent] = useState<HomeContent>(fallbackContent)

  useEffect(() => {
    fetch('/api/home/public')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { ok?: boolean; content?: HomeContent } | null) => {
        const next = data?.content ?? null
        if (!next) return
        setContent({
          headline: next.headline || fallbackContent.headline,
          tagline: next.tagline || fallbackContent.tagline,
          blurb: next.blurb || fallbackContent.blurb
        })
      })
      .catch(() => null)
  }, [])

  return (
    <div className="public-layout">
      <header className="public-header">
        <Link to="/login">
          <Button size="small" type="primary">
            Sign in
          </Button>
        </Link>
      </header>
      <section className="hero home-hero">
        <p className="eyebrow">{content.tagline}</p>
        <h1>{content.headline}</h1>
        <p className="lede">{content.blurb}</p>
        <div className="home-actions">
          <Link to="/login">
            <Button type="primary">Get a magic link</Button>
          </Link>
          <span className="home-meta">No password required.</span>
        </div>
      </section>
    </div>
  )
}
