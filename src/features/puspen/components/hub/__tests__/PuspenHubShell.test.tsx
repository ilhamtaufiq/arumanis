import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PuspenHubShell } from '../PuspenHubShell'
import { puspenHeadingReset } from '../../../lib/tokens'

describe('PuspenHubShell', () => {
    it('applies heading color reset for dark mode compatibility', () => {
        const { container } = render(
            <PuspenHubShell>
                <h3>Statistik Input Data Pengawas</h3>
            </PuspenHubShell>,
        )

        expect(container.firstChild).toHaveClass(...puspenHeadingReset.split(' '))
        expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Statistik Input Data Pengawas')
    })
})