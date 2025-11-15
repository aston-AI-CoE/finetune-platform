'use client';

import { useState } from 'react';
import Image from 'next/image';
import { HelpCircle, Settings, Sun, Moon, Plus, MessageSquare, MoreHorizontal } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const [showHelp, setShowHelp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [deterministicMode, setDeterministicMode] = useState(true);
  const [showDebugTimings, setShowDebugTimings] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const { navigateTo, createNewProject, projects, currentProjectId } = useStore();

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const handleNewProject = () => {
    setIsCreatingProject(true);

    // Simulate AWS fetching delay
    setTimeout(() => {
      createNewProject();
      setIsCreatingProject(false);
    }, 2500);
  };

  return (
    <>
      {/* Project Sidebar */}
      <div className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col">
        {/* Workato Logo */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-center">
          <button
            onClick={() => navigateTo('setup')}
            className="hover:opacity-80 transition-opacity"
          >
            <Image
              src="/workato-dark.webp"
              alt="Workato"
              width={240}
              height={80}
              className="h-20 w-auto"
            />
          </button>
        </div>

        {/* New Project Button */}
        <div className="p-3 border-b border-zinc-800">
          <Button
            onClick={handleNewProject}
            disabled={isCreatingProject}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            {isCreatingProject ? 'Creating...' : 'New Project'}
          </Button>
        </div>

        {/* Projects List */}
        <div className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer group',
                  currentProjectId === proj.id
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                )}
                onClick={() => {
                  navigateTo('setup');
                }}
              >
                <MessageSquare className="w-4 h-4 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{proj.name}</p>
                  <p className="text-xs text-zinc-500">{proj.date}</p>
                </div>
                <button
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-700 rounded transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  aria-label="More options"
                >
                  <MoreHorizontal className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="border-t border-zinc-800 p-2 space-y-1">
          <button
            onClick={() => setShowHelp(false)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors text-sm"
          >
            <HelpCircle className="w-4 h-4" />
            Help
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors text-sm"
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>
      </div>

      {/* Help Modal */}
      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle>About This Demo</DialogTitle>
            <DialogDescription className="space-y-3 pt-4">
              <p>
                This is a fully-functional canned demo of an LLM fine-tuning platform showcasing
                synthetic data generation and reinforcement learning workflows.
              </p>
              <p className="text-sm text-zinc-400">
                <strong>Key Features:</strong>
              </p>
              <ul className="list-disc list-inside text-sm text-zinc-400 space-y-1">
                <li>100% frontend - no real APIs or network calls</li>
                <li>Deterministic progress using seeded PRNG</li>
                <li>Simulated DSR1 and GPTOSS data generation</li>
                <li>RLEF/RLAIF training configuration</li>
                <li>Comprehensive metrics and visualizations</li>
              </ul>
              <p className="text-xs text-zinc-500 pt-2">
                Built with Next.js 14, TypeScript, Tailwind CSS, and Zustand
              </p>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Settings Modal */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">Deterministic Mode</p>
                  <p className="text-sm text-zinc-400">Use seeded random for consistent demos</p>
                </div>
                <Switch
                  checked={deterministicMode}
                  onCheckedChange={setDeterministicMode}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">Show Debug Timings</p>
                  <p className="text-sm text-zinc-400">Display timing info in console</p>
                </div>
                <Switch
                  checked={showDebugTimings}
                  onCheckedChange={setShowDebugTimings}
                />
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Creating Project Loading Overlay */}
      {isCreatingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-6">
            {/* Animated Circles */}
            <div className="relative w-24 h-24">
              {/* Outer circle */}
              <div className="absolute inset-0 rounded-full border-4 border-[#00A99D]/20"></div>
              {/* Spinning circle 1 */}
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#00A99D] animate-spin"></div>
              {/* Spinning circle 2 - slower */}
              <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-[#00A99D]/60 animate-spin" style={{ animationDuration: '1.5s' }}></div>
              {/* Inner pulse circle */}
              <div className="absolute inset-6 rounded-full bg-[#00A99D]/20 animate-pulse"></div>
            </div>

            {/* Text */}
            <div className="text-center">
              <p className="text-xl font-semibold text-white mb-2">Fetching AWS</p>
              <p className="text-sm text-zinc-400">Initializing environment...</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
