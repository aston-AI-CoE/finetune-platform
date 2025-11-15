'use client';

import { Sidebar } from './Sidebar';
import { StepProgress } from './StepProgress';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen bg-black">
      {/* Project Sidebar (left) */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Content with stepper always visible */}
        <div className="flex-1 flex overflow-hidden">
          <StepProgress />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
