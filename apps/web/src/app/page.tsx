'use client';

import { Button } from '@workspace/ui/components/button';
import { Toaster } from '@workspace/ui/components/sonner';

export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-svh">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Hello World</h1>
        <Button onClick={() => Toaster.success('Hello World')} size="sm">
          Button
        </Button>
      </div>
    </div>
  );
}
