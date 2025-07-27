import { SidebarProvider } from '@workspace/ui/components/sidebar';

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
      <div className="min-h-svh lg:p-2 w-full flex flex-col">
        <div className="lg:border lg:rounded-md flex flex-col items-center justify-start bg-background w-full h-full">
          <div className="overflow-auto w-full h-full">{children}</div>
        </div>
      </div>
    </SidebarProvider>
  );
}
