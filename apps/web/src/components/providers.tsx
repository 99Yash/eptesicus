'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeSwitcher } from '@workspace/ui/components/theme-switcher';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import * as React from 'react';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(() => new QueryClient());
  const [theme, setTheme] = React.useState<'light' | 'dark' | 'system'>(
    'system'
  );

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster richColors closeButton theme="system" />
      <ThemeSwitcher defaultValue="system" onChange={setTheme} value={theme} />
      <NuqsAdapter>{children}</NuqsAdapter>
    </QueryClientProvider>
  );
}
