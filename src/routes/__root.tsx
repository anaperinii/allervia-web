import { RootComponent } from '@/shared/layout/RootLayout'
import { NotFoundFallback } from '@/shared/components/errors/NotFoundFallback'
import { RouteErrorFallback } from '@/shared/components/errors/RouteErrorFallback'
import { createRootRoute } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: RootComponent,
  errorComponent: RouteErrorFallback,
  notFoundComponent: NotFoundFallback,
})
