import { index, route, type RouteConfig } from '@react-router/dev/routes';

export default [
  // Landing → redirect into docs (see home.tsx)
  index('routes/home.tsx'),
  route('docs/*', 'routes/docs.tsx'),
  route('api/search', 'routes/search.ts'),

  route('llms.txt', 'llms/index.ts'),
  route('llms-full.txt', 'llms/full.ts'),
  route('llms.mdx/docs/*', 'llms/mdx.ts'),

  route('*', 'routes/not-found.tsx'),
] satisfies RouteConfig;
