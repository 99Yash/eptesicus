import { SidebarProvider } from '@workspace/ui/components/sidebar';
import { cn } from '@workspace/ui/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
  headersNumber?: 1 | 2;
}

export function MainLayout({ children, headersNumber = 2 }: MainLayoutProps) {
  // const height = {
  //   1: 'h-[calc(100svh-40px)] lg:h-[calc(100svh-56px)]',
  //   2: 'h-[calc(100svh-80px)] lg:h-[calc(100svh-96px)]',
  // };
  return (
    <SidebarProvider>
      <div className="h-svh overflow-hidden lg:p-2 w-full">
        <div className="lg:border lg:rounded-md overflow-hidden flex flex-col items-center justify-start bg-container w-full">
          <div
            className={cn(
              'overflow-auto w-full h-full'
              // height[headersNumber as keyof typeof height]
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
