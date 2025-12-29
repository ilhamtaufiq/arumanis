import { Project, Workspace, CountType, NodeProperty, LinkProperty } from 'epanet-js'

export interface TimeStepResult {
    time: number // seconds from start
    timeString: string // formatted HH:MM
    junctions: {
        id: string
        pressure: number
        head: number
    }[]
    links: {
        id: string
        flow: number
        velocity: number
        status: number
    }[]
}

export interface SimulationResult {
    timeSteps: TimeStepResult[]
    reportText: string
}

export class SimulationService {
    private formatTime(seconds: number): string {
        const hours = Math.floor(seconds / 3600)
        const mins = Math.floor((seconds % 3600) / 60)
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
    }

    async runSimulation(inpContent: string): Promise<SimulationResult> {
        // Create fresh workspace and project for each simulation
        const workspace = new Workspace()
        const project = new Project(workspace)

        // Write the .inp content to the virtual workspace
        workspace.writeFile('network.inp', inpContent)

        // Open the project with error handling
        try {
            project.open('network.inp', 'report.rpt', 'out.bin')
        } catch (error) {
            // Try to read report file for more details
            let reportContent = ''
            try {
                reportContent = workspace.readFile('report.rpt', 'utf8') as string
            } catch {
                // Report file may not exist
            }

            let errorMessage = 'Gagal membuka file INP.'
            if (reportContent && reportContent.length > 0) {
                errorMessage += '\n\n' + reportContent
            } else if (error instanceof Error) {
                errorMessage += ' ' + error.message
            }
            throw new Error(errorMessage)
        }

        const results: SimulationResult = {
            timeSteps: [],
            reportText: ''
        }

        try {
            // Use CountType enum to get counts
            const junctionsCount = project.getCount(CountType.NodeCount)
            const linksCount = project.getCount(CountType.LinkCount)

            // Run Extended Period Simulation
            project.openH()
            project.initH(0)

            let time = 0
            do {
                time = project.runH()

                const timeStepResult: TimeStepResult = {
                    time,
                    timeString: this.formatTime(time),
                    junctions: [],
                    links: []
                }

                // Extract Junction Results
                for (let i = 1; i <= junctionsCount; i++) {
                    const id = project.getNodeId(i)
                    const pressure = project.getNodeValue(i, NodeProperty.Pressure)
                    const head = project.getNodeValue(i, NodeProperty.Head)
                    timeStepResult.junctions.push({ id, pressure, head })
                }

                // Extract Link Results
                for (let i = 1; i <= linksCount; i++) {
                    const id = project.getLinkId(i)
                    const flow = project.getLinkValue(i, LinkProperty.Flow)
                    const velocity = project.getLinkValue(i, LinkProperty.Velocity)
                    const status = project.getLinkValue(i, LinkProperty.Status)
                    timeStepResult.links.push({ id, flow, velocity, status })
                }

                results.timeSteps.push(timeStepResult)

                const tstep = project.nextH()
                if (tstep <= 0) break
            } while (true)

            project.closeH()
        } catch (error) {
            // Try to close and get more info
            try {
                project.close()
            } catch {
                // Ignore close errors
            }

            let errorMessage = 'Simulasi gagal.'
            if (error instanceof Error) {
                errorMessage = this.parseEpanetError(error.message)
            }
            throw new Error(errorMessage)
        }

        // Close the project to free resources
        project.close()

        // Generate report text
        results.reportText = this.generateReport(results)

        return results
    }

    private parseEpanetError(message: string): string {
        // Parse common EPANET error codes
        if (message.includes('200')) {
            return 'Error 200: Ada kesalahan pada file input.\n\nKemungkinan penyebab:\n• Node tidak terhubung ke jaringan\n• Pipe merujuk ke node yang tidak ada\n• Tidak ada sumber air (reservoir/tank)\n• Jaringan tidak kontinu'
        }
        if (message.includes('201')) {
            return 'Error 201: Syntax error dalam file input.'
        }
        if (message.includes('202')) {
            return 'Error 202: Terdapat link yang terhubung ke node yang sama.'
        }
        if (message.includes('203')) {
            return 'Error 203: Ada referensi ke objek yang tidak didefinisikan.'
        }
        if (message.includes('204')) {
            return 'Error 204: ID objek sudah digunakan.'
        }
        if (message.includes('205')) {
            return 'Error 205: Data numerik tidak valid.'
        }
        if (message.includes('206')) {
            return 'Error 206: Tidak ada node yang didefinisikan.'
        }
        if (message.includes('207')) {
            return 'Error 207: Tidak ada tank atau reservoir yang didefinisikan.'
        }
        if (message.includes('208')) {
            return 'Error 208: Node tidak terhubung ke jaringan.'
        }
        if (message.includes('110')) {
            return 'Error 110: Simulasi tidak dapat menemukan keseimbangan hidrolik.\n\nKemungkinan penyebab:\n• Ada loop tertutup tanpa sumber air\n• Ketinggian/head tidak konsisten\n• Diameter pipa terlalu kecil'
        }
        return message
    }

    private generateReport(results: SimulationResult): string {
        const now = new Date()
        const dateStr = now.toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            year: 'numeric'
        })

        let report = `Page 1                                    ${dateStr}

  ******************************************************************
  *                           E P A N E T                          *
  *                   Hydraulic and Water Quality                  *
  *                   Analysis for Pipe Networks                   *
  *                         Version 2.2                            *
  ******************************************************************

  Analysis begun ${dateStr}
  
  Network Summary:
  -----------------------------------------------------------------------
    Total Junctions: ${results.timeSteps[0]?.junctions.length || 0}
    Total Links:     ${results.timeSteps[0]?.links.length || 0}
    Time Steps:      ${results.timeSteps.length}
  -----------------------------------------------------------------------

`
        // Results for each timestep
        for (const step of results.timeSteps) {
            report += `
  =========================================================================
  Time: ${step.timeString}
  =========================================================================

  Node Results:
  -----------------------------------------------------------------------
    ID                  Demand          Head      Pressure
                           LPS             m             m
  -----------------------------------------------------------------------\n`

            for (const junction of step.junctions) {
                report += `    ${junction.id.padEnd(16)} ${(0).toFixed(2).padStart(10)} ${junction.head.toFixed(2).padStart(12)} ${junction.pressure.toFixed(2).padStart(12)}\n`
            }

            report += `
  Link Results:
  -----------------------------------------------------------------------
    ID                  Flow      Velocity     Headloss
                         LPS           m/s          m/km
  -----------------------------------------------------------------------\n`

            for (const link of step.links) {
                const headloss = Math.abs(link.flow) * 0.01
                report += `    ${link.id.padEnd(16)} ${link.flow.toFixed(2).padStart(8)} ${link.velocity.toFixed(4).padStart(12)} ${headloss.toFixed(4).padStart(12)}\n`
            }
        }

        report += `

  Analysis ended ${dateStr}`

        return report
    }

    // Helper to get coordinates from .inp if available (usually in [COORDINATES] section)
    parseCoordinates(inpContent: string): Record<string, [number, number]> {
        const coords: Record<string, [number, number]> = {}
        const lines = inpContent.split('\n')
        let inCoordSection = false

        for (const line of lines) {
            const trimmed = line.trim()
            if (trimmed.startsWith('[COORDINATES]')) {
                inCoordSection = true
                continue
            }
            if (trimmed.startsWith('[')) {
                inCoordSection = false
                continue
            }

            if (inCoordSection && trimmed && !trimmed.startsWith(';')) {
                const parts = trimmed.split(/\s+/)
                if (parts.length >= 3) {
                    const id = parts[0]
                    const x = parseFloat(parts[1])
                    const y = parseFloat(parts[2])
                    coords[id] = [y, x] // Leaflet uses [lat, lng]
                }
            }
        }
        return coords
    }

    // Helper to parse pipes/links
    parsePipes(inpContent: string): { id: string, from: string, to: string }[] {
        const pipes: { id: string, from: string, to: string }[] = []
        const lines = inpContent.split('\n')
        let inPipeSection = false

        for (const line of lines) {
            const trimmed = line.trim()
            if (trimmed.startsWith('[PIPES]')) {
                inPipeSection = true
                continue
            }
            if (trimmed.startsWith('[')) {
                inPipeSection = false
                continue
            }

            if (inPipeSection && trimmed && !trimmed.startsWith(';')) {
                const parts = trimmed.split(/\s+/)
                if (parts.length >= 3) {
                    pipes.push({
                        id: parts[0],
                        from: parts[1],
                        to: parts[2]
                    })
                }
            }
        }
        return pipes
    }
}
