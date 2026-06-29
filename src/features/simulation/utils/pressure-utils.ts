import type { SimulationResult } from '../services/SimulationService'

export const LOW_PRESSURE_THRESHOLD_M = 10

export function countLowPressureJunctions(
    results: SimulationResult | null,
    timeStepIndex = 0,
    threshold = LOW_PRESSURE_THRESHOLD_M,
): number {
    if (!results || results.timeSteps.length === 0) return 0
    const step = results.timeSteps[timeStepIndex] ?? results.timeSteps[0]
    return step.junctions.filter((j) => j.pressure < threshold).length
}