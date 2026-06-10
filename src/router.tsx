import { createRouter as createTanStackRouter } from "@tanstack/react-router"
import { QueryClient } from "@tanstack/react-query"
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query"
import { ConvexQueryClient } from "@convex-dev/react-query"
import { ConvexProvider } from "convex/react"
import { routeTree } from "./routeTree.gen"

export function getRouter() {
  // Convex deployment URL injected at build time by Vite (must be prefixed VITE_).
  const CONVEX_URL = (import.meta as any).env.VITE_CONVEX_URL as string
  if (!CONVEX_URL) {
    console.error("missing envar VITE_CONVEX_URL")
  }

  // Bridges Convex's reactive client with TanStack Query so Convex queries are
  // cached, deduped, and SSR-friendly through React Query.
  const convexQueryClient = new ConvexQueryClient(CONVEX_URL)

  const queryClient: QueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        queryKeyHashFn: convexQueryClient.hashFn(),
        queryFn: convexQueryClient.queryFn(),
      },
    },
  })
  convexQueryClient.connect(queryClient)

  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    context: { queryClient },
    // Wrap the whole tree in ConvexProvider so components can use Convex hooks.
    Wrap: ({ children }) => (
      <ConvexProvider client={convexQueryClient.convexClient}>
        {children}
      </ConvexProvider>
    ),
  })

  // Hydrates React Query state across the SSR boundary for TanStack Start.
  setupRouterSsrQueryIntegration({ router, queryClient })

  return router
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
