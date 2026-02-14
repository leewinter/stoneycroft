import { Button } from 'antd'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

type HomeProject = {
  id: string
  name: string
  url: string
  sourceUrl: string
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

const fallbackContent: HomeContent = {
  headline: 'Keep your ops view focused, fast, and human.',
  tagline: 'Stoneycroft',
  blurb:
    'Stoneycroft gives your team a calm control room for logs, users, and the essentials. Sign in with a magic link to get started.',
  projects: []
}

export default function HomePage() {
  const [content, setContent] = useState<HomeContent>(fallbackContent)
  const heroRef = useRef<HTMLDivElement | null>(null)
  const bgRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    fetch('/api/home/public')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { ok?: boolean; content?: HomeContent } | null) => {
        const next = data?.content ?? null
        if (!next) return
        setContent({
          headline: next.headline || fallbackContent.headline,
          tagline: next.tagline || fallbackContent.tagline,
          blurb: next.blurb || fallbackContent.blurb,
          projects: Array.isArray(next.projects) ? next.projects : []
        })
      })
      .catch(() => null)
  }, [])

  useEffect(() => {
    const hero = heroRef.current
    const bg = bgRef.current
    if (!hero || !bg) return

    let raf = 0
    const handleMove = (event: MouseEvent) => {
      if (raf) cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const rect = hero.getBoundingClientRect()
        const x = (event.clientX - rect.left) / rect.width - 0.5
        const y = (event.clientY - rect.top) / rect.height - 0.5
        const max = 8
        bg.style.transform = `translate3d(${x * max}%, ${y * max}%, 0)`
      })
    }

    hero.addEventListener('mousemove', handleMove)
    return () => {
      hero.removeEventListener('mousemove', handleMove)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  const visibleProjects = content.projects.filter((project) => project.active)

  return (
    <div className="public-layout">
      <header className="public-header">
        <Link to="/login">
          <Button size="small" type="primary">
            Sign in
          </Button>
        </Link>
      </header>
      <section className="hero home-hero" ref={heroRef}>
        <div className="home-hero__bg" ref={bgRef} />
        <p className="eyebrow">{content.tagline}</p>
        <h1>{content.headline}</h1>
        <p className="lede">{content.blurb}</p>
      </section>
      {visibleProjects.length > 0 && (
        <section className="home-projects">
          <h2>Apps</h2>
          <div className="home-projects-grid home-projects-grid--fixed">
            {visibleProjects.map((project, index) => (
              <article key={project.id || project.url || `${project.name}-${index}`} className="home-project">
                {project.image && (
                  <div className="home-project__image">
                    <img src={project.image} alt={project.name} loading="lazy" />
                  </div>
                )}
                <div className="home-project__body">
                  <h3>{project.name}</h3>
                  {project.description && <p>{project.description}</p>}
                  {project.url && (
                    <a
                      className="home-project__link"
                      href={project.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Visit app
                    </a>
                  )}
                  {project.sourceUrl && (
                    <a
                      className="home-project__link home-project__link--secondary"
                      href={project.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Source code
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
