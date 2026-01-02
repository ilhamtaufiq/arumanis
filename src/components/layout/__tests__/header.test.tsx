import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { Header } from "../header"
import { useAuthStore } from "@/stores/auth-stores"

// Mock dependencies
vi.mock("@/stores/auth-stores", () => ({
    useAuthStore: vi.fn(),
}))

vi.mock("@tanstack/react-router", () => ({
    Link: ({ children }: any) => <a>{children}</a>,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/' }),
}))

vi.mock("../breadcrumb-nav", () => ({
    AutoBreadcrumbs: () => <div data-testid="breadcrumbs" />,
}))

vi.mock("../fiscal-year-selector", () => ({
    FiscalYearSelector: () => <div data-testid="year-selector" />,
}))

vi.mock("../theme-toggle", () => ({
    ThemeToggle: () => <div data-testid="theme-toggle" />,
}))

vi.mock("@/features/notifications/components/NotificationBell", () => ({
    NotificationBell: () => <div data-testid="notifications" />,
}))

vi.mock("@/components/ui/sidebar", () => ({
    SidebarTrigger: () => <div data-testid="sidebar-trigger" />,
}))

vi.mock("@/components/ui/separator", () => ({
    Separator: () => <div data-testid="separator" />,
}))

vi.mock("@/components/search", () => ({
    Search: () => <div data-testid="search-mock" />,
}))

vi.mock("@/components/sign-out-dialog", () => ({
    SignOutDialog: () => <div data-testid="sign-out-dialog" />,
}))

describe("Header", () => {
    it("renders header elements for admin", () => {
        vi.mocked(useAuthStore).mockReturnValue({
            auth: {
                user: { name: "Admin", roles: ["admin"] },
            },
        } as any)

        render(<Header />)

        expect(screen.getByTestId("breadcrumbs")).toBeDefined()
        expect(screen.getByTestId("year-selector")).toBeDefined()
        expect(screen.getByTestId("theme-toggle")).toBeDefined()
        expect(screen.getByTestId("notifications")).toBeDefined()
    })

    it("does not render search for non-admin", () => {
        vi.mocked(useAuthStore).mockReturnValue({
            auth: {
                user: { name: "User", roles: ["user"] },
            },
        } as any)

        render(<Header />)
        expect(screen.queryByTestId("search")).toBeNull()
    })
})
