#!/usr/bin/env node
/**
 * Compare TanStack routes with ProtectedRoute / admin guard coverage.
 * Usage: bun run audit:routes
 * Exit 1 when admin-only base paths lack any guard in route files.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const routesDir = resolve(root, 'src/routes/_authenticated')
const protectedRouteFile = resolve(root, 'src/components/ProtectedRoute.tsx')
const routeTreeFile = resolve(root, 'src/routeTree.gen.ts')

const PUBLIC_ROUTE_PREFIXES = [
    '/tools',
    '/puspen',
    '/publikasi',
    '/sign-in',
    '/oauth-callback',
    '/forbidden',
    '/unauthorized',
    '/privacy',
    '/privacy-policy',
    '/terms',
    '/search',
    '/capaian-spm',
    '/tujuan-manfaat-hasil',
    '/rancang-bangun-inovasi',
]

const GUARD_PATTERNS = [
    /ProtectedRoute/,
    /requireAdmin\s*\(/,
    /isAdminUser\s*\(/,
    /canViewAdvancedMvpFeatures\s*\(/,
    /redirect\s*\(\s*\{[^}]*to:\s*['"]\/forbidden['"]/,
    /Navigate\s+to=["']\/forbidden["']/,
    /roles\?\.includes\(\s*['"]admin['"]\s*\)/,
    /role\.name\s*===\s*['"]admin['"]/,
    /===\s*['"]admin['"]/,
]

function extractAdminOnlyRoutes(source) {
    const match = source.match(/const ADMIN_ONLY_ROUTES\s*=\s*\[([\s\S]*?)\]/)
    if (!match) return []
    return [...match[1].matchAll(/['"]([^'"]+)['"]/g)].map((m) => m[1])
}

function extractFullPaths(source) {
    return [...source.matchAll(/fullPath:\s*'([^']+)'/g)].map((m) => m[1])
}

function normalizePath(path) {
    return path.replace(/\/+$/, '') || '/'
}

function basePath(path) {
    const normalized = normalizePath(path)
    const segment = normalized.split('/').filter(Boolean)[0]
    return segment ? `/${segment}` : '/'
}

function isPublicRoute(path) {
    const normalized = normalizePath(path)
    if (normalized === '/' || normalized === '/$') return true
    return PUBLIC_ROUTE_PREFIXES.some(
        (prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`),
    )
}

function isAuthenticatedRoute(path) {
    const normalized = normalizePath(path)
    if (isPublicRoute(normalized)) return false
    if (normalized === '/$') return false
    return true
}

function walkRouteFiles(dir) {
    const files = []
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry)
        if (statSync(full).isDirectory()) {
            files.push(...walkRouteFiles(full))
        } else if (entry.endsWith('.tsx')) {
            files.push(full)
        }
    }
    return files
}

function filePathToRoutePath(filePath) {
    const rel = relative(routesDir, filePath).replace(/\\/g, '/')
    let route = '/' + rel.replace(/\.tsx$/, '')
    route = route.replace(/\/index$/, '/')
    route = route.replace(/\$id/g, ':id')
    route = route.replace(/\$slug/g, ':slug')
    route = route.replace(/\$mediaId/g, ':mediaId')
    route = route.replace(/\$shareToken/g, ':shareToken')
    route = route.replace(/\/+$/, '') || '/'
    return route
}

function hasGuard(source) {
    return GUARD_PATTERNS.some((pattern) => pattern.test(source))
}

function main() {
    if (!existsSync(routeTreeFile)) {
        console.error('Missing routeTree.gen.ts — run dev or build first.')
        process.exit(1)
    }

    const adminOnlyRoutes = extractAdminOnlyRoutes(readFileSync(protectedRouteFile, 'utf8'))
    const fullPaths = extractFullPaths(readFileSync(routeTreeFile, 'utf8'))
        .map(normalizePath)
        .filter(isAuthenticatedRoute)

    const routeFiles = walkRouteFiles(routesDir)
    const fileAudit = routeFiles.map((file) => {
        const source = readFileSync(file, 'utf8')
        const routePath = filePathToRoutePath(file)
        return {
            file: relative(root, file),
            routePath,
            base: basePath(routePath),
            guarded: hasGuard(source),
        }
    })

    const unguardedAdminRoutes = fileAudit.filter(
        (entry) => adminOnlyRoutes.includes(entry.base) && !entry.guarded,
    )

    const adminBasesInApp = new Set(fullPaths.map(basePath))
    const adminOnlyWithoutRoute = adminOnlyRoutes.filter((route) => !adminBasesInApp.has(route))

    const unguardedAuthenticated = fileAudit.filter((entry) => !entry.guarded)

    console.log('\nArumanis route permission audit\n')
    console.log(`Admin-only bases (ProtectedRoute.tsx): ${adminOnlyRoutes.length}`)
    console.log(`Authenticated route files: ${fileAudit.length}`)
    console.log(`Guarded route files: ${fileAudit.filter((e) => e.guarded).length}`)

    if (unguardedAdminRoutes.length > 0) {
        console.log('\n✗ Admin-only routes without guard:')
        for (const entry of unguardedAdminRoutes) {
            console.log(`  - ${entry.routePath} (${entry.file})`)
        }
    } else {
        console.log('\n✓ All admin-only base routes have a guard')
    }

    if (adminOnlyWithoutRoute.length > 0) {
        console.log('\n⚠ ADMIN_ONLY_ROUTES entries with no frontend route:')
        for (const route of adminOnlyWithoutRoute) {
            console.log(`  - ${route}`)
        }
    }

    if (process.env.AUDIT_VERBOSE === '1' && unguardedAuthenticated.length > 0) {
        console.log('\nℹ Authenticated routes without explicit guard (may be intentional):')
        for (const entry of unguardedAuthenticated) {
            console.log(`  - ${entry.routePath} (${entry.file})`)
        }
    }

    if (unguardedAdminRoutes.length > 0) {
        console.error(`\n${unguardedAdminRoutes.length} admin-only route(s) missing guards`)
        process.exit(1)
    }

    console.log('\nAudit passed')
}

main()