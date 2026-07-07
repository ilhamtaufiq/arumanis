import { describe, expect, it } from 'vitest'
import {
  buildLandingStaticShellHtml,
  injectLandingShell,
  LANDING_HERO_COPY,
} from '../landing-shell'

describe('landing-shell', () => {
  it('injects static hero shell and critical css into index html', () => {
    const html = '<!doctype html><html><head></head><body><div id="root"></div></body></html>'
    const output = injectLandingShell(html)

    expect(output).toContain('id="landing-critical-css"')
    expect(output).toContain('id="landing-static-shell"')
    expect(output).toContain(LANDING_HERO_COPY.description)
    expect(output).toContain('class="landing-shell-description"')
  })

  it('renders accessible hero markup for first paint', () => {
    const shell = buildLandingStaticShellHtml()

    expect(shell).toContain('<h1 class="landing-shell-title">')
    expect(shell).toContain('<p class="landing-shell-description">')
    expect(shell).toContain('fetchpriority="high"')
  })
})