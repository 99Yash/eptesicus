'use client';

import { buttonVariants } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import Link from 'next/link';
import { useUser } from '~/hooks/use-user';

export default function Page() {
  const { data: user } = useUser();

  return (
    <div className="flex items-center justify-center min-h-svh">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Hello World</h1>
        {user ? (
          <p>Hello {user.user.name}</p>
        ) : (
          <Link
            href="/signin"
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
          >
            Sign In
          </Link>
        )}
      </div>
    </div>
  );
}
