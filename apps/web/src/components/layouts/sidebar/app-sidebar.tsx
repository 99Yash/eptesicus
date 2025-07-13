'use client';

import { Button } from '@workspace/ui/components/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from '@workspace/ui/components/sidebar';
import { Github, SidebarIcon } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { toggleSidebar } = useSidebar();

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <div className="w-full flex items-center justify-between gap-2">
          <Button
            className="w-fit"
            size="xs"
            variant="outline"
            asChild
            onClick={toggleSidebar}
          >
            <SidebarIcon className="size-4" />
          </Button>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <div className="w-full flex flex-col gap-2">
          <div className="text-balance text-lg font-semibold leading-tight group-hover/sidebar:underline">
            Open-source layouts by lndev-ui
          </div>
        </div>
      </SidebarContent>
      <SidebarFooter>
        <div className="w-full flex flex-col gap-2">
          <div className="w-full flex items-center justify-between">
            <Button size="icon" variant="secondary" asChild>
              <Link
                href="https://github.com/ln-dev7/circle"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
