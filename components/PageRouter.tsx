'use client';

import { useStore } from '@/store/useStore';
import { SetupPage } from './pages/SetupPage';
import { ProjectEnvironmentPage } from './pages/ProjectEnvironmentPage';
import { DataPage } from './pages/DataPage';
import { FinetunePage } from './pages/FinetunePage';
import { DashboardPage } from './pages/DashboardPage';

export function PageRouter() {
  const { project } = useStore();

  switch (project.currentPage) {
    case 'environment':
      return <ProjectEnvironmentPage key={project.id} />;
    case 'setup':
      return <SetupPage key={project.id} />;
    case 'data':
      return <DataPage key={project.id} />;
    case 'finetune':
      return <FinetunePage key={project.id} />;
    case 'dashboard':
      return <DashboardPage key={project.id} />;
    default:
      return <ProjectEnvironmentPage key={project.id} />;
  }
}
