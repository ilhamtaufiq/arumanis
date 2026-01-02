import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { Button } from "../button"

describe("Button", () => {
    it("renders correctly", () => {
        render(<Button>Click me</Button>)
        expect(screen.getByRole("button", { name: /click me/i })).toBeDefined()
    })

    it("applies variant classes", () => {
        const { container } = render(<Button variant="destructive">Delete</Button>)
        const button = container.querySelector('button')
        expect(button?.className).toContain('bg-destructive')
    })

    it("applies size classes", () => {
        const { container } = render(<Button size="sm">Small</Button>)
        const button = container.querySelector('button')
        expect(button?.className).toContain('h-8')
    })

    it("handles click events", () => {
        const handleClick = vi.fn()
        render(<Button onClick={handleClick}>Click</Button>)
        fireEvent.click(screen.getByRole("button"))
        expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it("is disabled when disabled prop is true", () => {
        render(<Button disabled>Disabled</Button>)
        expect(screen.getByRole("button")).toBeDisabled()
    })
})
