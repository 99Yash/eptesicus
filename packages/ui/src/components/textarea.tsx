import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@workspace/ui/lib/utils';

export const textareaVariants = cva(
  'border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex field-sizing-content min-h-16 w-full rounded-md border px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm placeholder:text-xs',
  {
    variants: {
      variant: {
        default:
          'border-input border bg-transparent dark:bg-input/30 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        transparent:
          'border-transparent bg-transparent focus-visible:border-transparent focus-visible:ring-transparent data-[error=true]:border-destructive data-[error=true]:ring-destructive/20 dark:data-[error=true]:ring-destructive/40',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface TextareaProps
  extends React.ComponentProps<'textarea'>,
    VariantProps<typeof textareaVariants> {}

function Textarea({ className, variant, ...props }: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(textareaVariants({ variant, className }))}
      {...props}
    />
  );
}

export { Textarea };
