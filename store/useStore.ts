import { create } from 'zustand';

// Types
export interface Guideline {
  id: string;
  text: string;
}

export interface ProjectListItem {
  id: string;
  name: string;
  date: string;
}

export interface Project {
  id: string;
  guidelines: Guideline[];
  currentPage: 'setup' | 'environment' | 'data' | 'finetune' | 'dashboard';
}

export interface Dataset {
  name: string;
  rows: number;
  cols: number;
  type: 'uploaded' | 'synthetic';
}

export type StrategyType = 'FT' | 'SFT' | 'RL';

export interface RLOpts {
  algorithms: ('PPO' | 'DPO' | 'GRPO')[];
  rlefRegex: string;
  rlaifGuidelines: Guideline[];
}

export interface EnvironmentConfig {
  cloudProvider: 'aws' | 'workato';
  region: string;
  instanceType: string;
  vpcOption: 'new' | 'existing';
  existingVpcId: string;
  storageSize: string;
  isConnected: boolean;
}

export interface TrainingConfig {
  dataset: string | null;
  aiJudge: string;
  defaultModel: string;
  model: string | null;
  strategy: StrategyType;
  strategies: string[];
  rlOpts: RLOpts;
  currentStep: number;
  awsConnected: boolean;
}

export interface Run {
  status: 'idle' | 'running' | 'complete' | 'error';
  progress: number;
  logs: string[];
}

export interface Metrics {
  gpt4o: {
    intent: number;
    policy: number;
    system: number;
    p50: number;
    cost: number;
  };
  trained: {
    intent: number;
    policy: number;
    system: number;
    p50: number;
    cost: number;
  };
}

export interface DataGenProgress {
  dsr1: {
    stage: number;
    total: number;
    running: boolean;
    complete: boolean;
  };
  gptoss: {
    stage: number;
    total: number;
    running: boolean;
    complete: boolean;
  };
  showRetry: boolean;
}

interface StoreState {
  // Projects list
  projects: ProjectListItem[];
  currentProjectId: string;

  // Project state
  project: Project;
  setProject: (project: Partial<Project>) => void;
  addGuideline: (guideline: Guideline) => void;
  removeGuideline: (id: string) => void;

  // Environment config
  environmentConfig: EnvironmentConfig;
  setEnvironmentConfig: (config: Partial<EnvironmentConfig>) => void;

  // Dataset state
  dataset: Dataset | null;
  setDataset: (dataset: Dataset | null) => void;

  // Data generation progress
  dataGenProgress: DataGenProgress;
  setDataGenProgress: (progress: Partial<DataGenProgress>) => void;

  // Training config
  trainingConfig: TrainingConfig;
  setTrainingConfig: (config: Partial<TrainingConfig>) => void;

  // Training run
  run: Run;
  setRun: (run: Partial<Run>) => void;
  addLog: (log: string) => void;

  // Metrics
  metrics: Metrics;
  setMetrics: (metrics: Partial<Metrics>) => void;

  // Navigation
  navigateTo: (page: Project['currentPage']) => void;

  // Project management
  createNewProject: () => void;
  updateProjectName: (projectId: string, name: string) => void;
}

export const useStore = create<StoreState>((set) => ({
  // Projects list
  projects: [
    { id: '2', name: 'E-commerce Bot Fine-tune', date: 'Yesterday' },
    { id: '3', name: 'Healthcare Assistant', date: '3 days ago' },
    { id: '4', name: 'Legal Document Analyzer', date: '1 week ago' },
  ],
  currentProjectId: '2',

  // Initial project state
  project: {
    id: '2',
    guidelines: [],
    currentPage: 'environment',
  },

  setProject: (project) =>
    set((state) => ({ project: { ...state.project, ...project } })),

  addGuideline: (guideline) =>
    set((state) => ({
      project: {
        ...state.project,
        guidelines: [...state.project.guidelines, guideline],
      },
    })),

  removeGuideline: (id) =>
    set((state) => ({
      project: {
        ...state.project,
        guidelines: state.project.guidelines.filter((g) => g.id !== id),
      },
    })),

  // Environment config
  environmentConfig: {
    cloudProvider: 'aws',
    region: 'us-west-2',
    instanceType: 'p4d.24xlarge',
    vpcOption: 'new',
    existingVpcId: '',
    storageSize: '500',
    isConnected: false,
  },

  setEnvironmentConfig: (config) =>
    set((state) => ({
      environmentConfig: { ...state.environmentConfig, ...config },
    })),

  // Dataset state
  dataset: null,
  setDataset: (dataset) => set({ dataset }),

  // Data generation progress
  dataGenProgress: {
    dsr1: { stage: 0, total: 6, running: false, complete: false },
    gptoss: { stage: 0, total: 5, running: false, complete: false },
    showRetry: false,
  },

  setDataGenProgress: (progress) =>
    set((state) => ({
      dataGenProgress: { ...state.dataGenProgress, ...progress },
    })),

  // Training config
  trainingConfig: {
    dataset: null,
    aiJudge: 'Kimi K2 Thinking',
    defaultModel: 'Qwen3 235B A22B Instruct',
    model: null,
    strategy: 'RL',
    strategies: ['RL'],
    rlOpts: {
      algorithms: ['GRPO'],
      rlefRegex: '<intent>(.*?)</intent>',
      rlaifGuidelines: [],
    },
    currentStep: 1,
    awsConnected: true,
  },

  setTrainingConfig: (config) =>
    set((state) => ({
      trainingConfig: { ...state.trainingConfig, ...config },
    })),

  // Training run
  run: {
    status: 'idle',
    progress: 0,
    logs: [],
  },

  setRun: (run) => set((state) => ({ run: { ...state.run, ...run } })),

  addLog: (log) =>
    set((state) => ({ run: { ...state.run, logs: [...state.run.logs, log] } })),

  // Metrics
  metrics: {
    gpt4o: {
      intent: 95,
      policy: 95,
      system: 93,
      p50: 350,
      cost: 0.6,
    },
    trained: {
      intent: 99.2,
      policy: 97.5,
      system: 96.8,
      p50: 180,
      cost: 0.1,
    },
  },

  setMetrics: (metrics) =>
    set((state) => ({
      metrics: { ...state.metrics, ...metrics },
    })),

  // Navigation
  navigateTo: (page) =>
    set((state) => ({
      project: { ...state.project, currentPage: page },
    })),

  // Project management
  createNewProject: () =>
    set((state) => {
      const newId = Date.now().toString();
      const newProject: ProjectListItem = {
        id: newId,
        name: 'Untitled Project',
        date: 'Just now',
      };

      return {
        projects: [newProject, ...state.projects],
        currentProjectId: newId,
        project: {
          id: newId,
          guidelines: [],
          currentPage: 'environment',
        },
        environmentConfig: {
          cloudProvider: 'aws',
          region: 'us-west-2',
          instanceType: 'p4d.24xlarge',
          vpcOption: 'new',
          existingVpcId: '',
          storageSize: '500',
          isConnected: false,
        },
        dataset: null,
        dataGenProgress: {
          dsr1: { stage: 0, total: 6, running: false, complete: false },
          gptoss: { stage: 0, total: 5, running: false, complete: false },
          showRetry: false,
        },
        trainingConfig: {
          dataset: null,
          aiJudge: 'Kimi K2 Thinking',
          defaultModel: 'Qwen3 235B A22B Instruct',
          model: null,
          strategy: 'RL',
          strategies: ['RL'],
          rlOpts: {
            algorithms: ['GRPO'],
            rlefRegex: '<intent>(.*?)</intent>',
            rlaifGuidelines: [],
          },
          currentStep: 1,
          awsConnected: true,
        },
        run: {
          status: 'idle',
          progress: 0,
          logs: [],
        },
      };
    }),

  updateProjectName: (projectId: string, name: string) =>
    set((state) => ({
      projects: state.projects.map(p =>
        p.id === projectId ? { ...p, name } : p
      ),
    })),
}));
