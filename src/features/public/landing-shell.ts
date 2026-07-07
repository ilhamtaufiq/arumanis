/**
 * Static landing shell for first paint (LCP) before React hydrates.
 * Keep hero copy in sync with publicMessages.id.landing.hero in messages.ts.
 */
export const LANDING_HERO_COPY = {
  tagline: 'Arumanis',
  title: 'Air Minum dan Sanitasi.',
  description:
    'Portal informasi publik capaian layanan air minum dan sanitasi Kabupaten Cianjur — peta interaktif, data per desa, dan dokumen terbuka dalam satu tempat.',
  ctaAchievements: 'Lihat Capaian SPM',
  ctaPublications: 'Lihat Publikasi',
  signIn: 'Masuk',
} as const

export const LANDING_CRITICAL_CSS = `
  #landing-static-shell {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
    color: #fff;
    background:
      radial-gradient(circle at top left, rgba(255, 159, 252, 0.9), transparent 38%),
      radial-gradient(circle at bottom right, rgba(82, 39, 255, 0.95), transparent 42%),
      linear-gradient(135deg, #b497cf 0%, #8f78ff 48%, #5227ff 100%);
    -webkit-font-smoothing: antialiased;
  }
  #landing-static-shell .landing-shell-header {
    position: fixed;
    top: 1.25rem;
    left: 0;
    right: 0;
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 72rem;
    margin: 0 auto;
    padding: 0 1.5rem;
  }
  #landing-static-shell .landing-shell-logo {
    height: 2.5rem;
    width: auto;
  }
  #landing-static-shell .landing-shell-sign-in {
    border-radius: 9999px;
    background: #fff;
    color: #020617;
    padding: 0.5rem 1rem;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    text-decoration: none;
  }
  #landing-static-shell .landing-shell-hero {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 5rem 1.5rem 3rem;
    text-align: center;
  }
  #landing-static-shell .landing-shell-tagline {
    display: inline-block;
    margin-bottom: 2rem;
    font-size: 18px;
    font-weight: 700;
    letter-spacing: 0.3em;
    text-transform: uppercase;
  }
  #landing-static-shell .landing-shell-title {
    margin: 0 0 1.5rem;
    font-size: clamp(2.5rem, 8vw, 4.5rem);
    font-weight: 500;
    line-height: 0.95;
    letter-spacing: -0.04em;
  }
  #landing-static-shell .landing-shell-description {
    margin: 0 auto;
    max-width: 42rem;
    font-size: clamp(1rem, 2.5vw, 1.25rem);
    line-height: 1.625;
    font-weight: 300;
    color: rgba(255, 255, 255, 0.85);
  }
  #landing-static-shell .landing-shell-cta-row {
    margin-top: 2rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: center;
  }
  #landing-static-shell .landing-shell-cta-primary,
  #landing-static-shell .landing-shell-cta-secondary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 9999px;
    padding: 0.75rem 1.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    text-decoration: none;
  }
  #landing-static-shell .landing-shell-cta-primary {
    background: #fff;
    color: #020617;
  }
  #landing-static-shell .landing-shell-cta-secondary {
    border: 1px solid rgba(255, 255, 255, 0.25);
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }
`

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function buildLandingStaticShellHtml() {
  const copy = LANDING_HERO_COPY

  return `
    <div id="landing-static-shell" aria-hidden="true">
      <header class="landing-shell-header">
        <img class="landing-shell-logo" src="/arumanis.svg" alt="Arumanis" width="120" height="40" decoding="async" fetchpriority="high" />
        <a class="landing-shell-sign-in" href="/sign-in">${escapeHtml(copy.signIn)}</a>
      </header>
      <section class="landing-shell-hero">
        <div>
          <span class="landing-shell-tagline">${escapeHtml(copy.tagline)}</span>
          <h1 class="landing-shell-title">${escapeHtml(copy.title)}</h1>
          <p class="landing-shell-description">${escapeHtml(copy.description)}</p>
          <div class="landing-shell-cta-row">
            <a class="landing-shell-cta-primary" href="#capaian-spm">${escapeHtml(copy.ctaAchievements)}</a>
            <a class="landing-shell-cta-secondary" href="/publikasi">${escapeHtml(copy.ctaPublications)}</a>
          </div>
        </div>
      </section>
    </div>`
}

export function injectLandingShell(indexHtml: string) {
  const styleTag = `<style id="landing-critical-css">${LANDING_CRITICAL_CSS}</style>`
  const withStyle = indexHtml.includes('id="landing-critical-css"')
    ? indexHtml
    : indexHtml.replace('</head>', `${styleTag}\n</head>`)

  const shell = buildLandingStaticShellHtml()
  if (withStyle.includes('id="landing-static-shell"')) {
    return withStyle
  }

  return withStyle.replace('<div id="root"></div>', `<div id="root">${shell}</div>`)
}