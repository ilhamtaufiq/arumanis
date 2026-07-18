import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router';
import { RootProvider } from 'fumadocs-ui/provider/react-router';
import type { Route } from './+types/root';
import './app.css';
import SearchDialog from '@/components/search';
import NotFound from './routes/not-found';
import { brand } from '@/lib/brand';

export const links: Route.LinksFunction = () => [
  { rel: 'icon', href: brand.faviconSvg, type: 'image/svg+xml' },
  { rel: 'icon', href: brand.logoPublicPath, type: 'image/svg+xml' },
  { rel: 'apple-touch-icon', href: brand.logoPublicPath },
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,400;0,600;0,700;1,400&display=swap',
  },
  { rel: 'canonical', href: brand.docsUrl },
];

export function meta({}: Route.MetaArgs) {
  return [
    { title: brand.docsTitle },
    { name: 'description', content: brand.description },
    { name: 'title', content: brand.docsTitle },
    { name: 'theme-color', content: brand.primary },
    { name: 'application-name', content: brand.appName },
    { name: 'author', content: brand.appName },
    { name: 'keywords', content: 'Arumanis, dokumentasi, air minum, sanitasi, Cianjur, SPSE, pengawas' },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: brand.appName },
    { property: 'og:locale', content: 'id_ID' },
    { property: 'og:url', content: brand.docsUrl },
    { property: 'og:title', content: brand.docsTitle },
    { property: 'og:description', content: brand.description },
    { property: 'og:image', content: brand.ogImage },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:url', content: brand.docsUrl },
    { name: 'twitter:title', content: brand.docsTitle },
    { name: 'twitter:description', content: brand.description },
    { name: 'twitter:image', content: brand.ogImage },
  ];
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: brand.docsTitle,
              url: brand.docsUrl,
              description: brand.description,
              publisher: {
                '@type': 'Organization',
                name: brand.appName,
                url: brand.siteUrl,
                logo: brand.ogImage,
              },
              inLanguage: 'id-ID',
            }),
          }}
        />
      </head>
      <body className="flex flex-col min-h-screen">
        <RootProvider search={{ SearchDialog }}>{children}</RootProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = 'Oops!';
  let details = 'Terjadi kesalahan tak terduga.';
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) return <NotFound />;
    message = 'Error';
    details = error.statusText;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 w-full max-w-[1400px] mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
