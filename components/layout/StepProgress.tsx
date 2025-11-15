'use client';

import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

const steps = [
  { id: 'environment', name: 'Environment Setup', page: 'environment' as const },
  { id: 'setup', name: 'Project Setup', page: 'setup' as const },
  { id: 'data', name: 'Data Setup', page: 'data' as const },
  { id: 'finetune', name: 'Training', page: 'finetune' as const },
  { id: 'dashboard', name: 'Results', page: 'dashboard' as const },
];

export function StepProgress() {
  const { project } = useStore();

  const currentIndex = steps.findIndex((step) => step.page === project.currentPage);

  return (
    <div className="w-64 bg-zinc-950 border-r border-zinc-800 py-8 px-6">
      <h2 className="text-sm font-semibold text-zinc-400 mb-6 uppercase tracking-wide">
        Workflow Progress
      </h2>

      <div className="space-y-2">
        {steps.map((step, index) => {
          const isActive = step.page === project.currentPage;
          const isCompleted = index < currentIndex;

          return (
            <div key={step.id} className="flex items-center space-x-3">
              {/* Step indicator */}
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors',
                  isActive && 'bg-[#00A99D] text-white',
                  isCompleted && 'bg-[#00A99D] text-white',
                  !isActive && !isCompleted && 'bg-zinc-800 text-zinc-400'
                )}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>

              {/* Step name */}
              <div className="flex-1">
                <p
                  className={cn(
                    'text-sm font-medium transition-colors',
                    isActive && 'text-white',
                    isCompleted && 'text-[#00A99D]',
                    !isActive && !isCompleted && 'text-zinc-500'
                  )}
                >
                  {step.name}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
