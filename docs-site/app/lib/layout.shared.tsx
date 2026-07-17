import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { brand } from './brand';

export function BrandMark({ className = 'h-8 w-auto' }: { className?: string }) {
  return (
    <span className="inline-flex items-center gap-2.5 font-semibold tracking-tight">
      <img
        src={brand.logoPublicPath}
        alt={brand.appName}
        className={className}
        width={120}
        height={40}
        decoding="async"
      />
      <span className="hidden sm:inline text-[15px]">{brand.docsTitle}</span>
    </span>
  );
}

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: <BrandMark />,
      url: '/docs',
    },
    links: [
      {
        text: 'Dokumentasi',
        url: '/docs',
        active: 'nested-url',
      },
      {
        text: 'Buka Aplikasi',
        url: '/',
        external: true,
      },
      {
        text: 'Panel Pengawasan',
        url: '/pengawasan/',
        external: true,
      },
    ],
  };
}
