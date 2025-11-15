# LLM Fine-Tuning Platform (Demo)

A fully-functional **canned demo** of an LLM fine-tuning platform showcasing synthetic data generation and reinforcement learning fine-tuning workflows. Built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- **Customer Intentions & Policies** - Chat-style interface for defining support guidelines
- **Synthetic Data Generation** - Simulated DSR1 and GPTOSS pipelines
- **Training Wizard** - 4-step configuration for RLEF/RLAIF training
- **Results Dashboard** - Comprehensive metrics, charts, and model comparisons

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and walk through the 4-page workflow.

## Project Structure

```
├── components/
│   ├── layout/         # Sidebar, progress tracker, main layout
│   ├── pages/          # 4 main pages (Setup, Data, Finetune, Dashboard)
│   └── ui/             # shadcn/ui components
├── store/              # Zustand state management
├── lib/                # Utilities (PRNG, cn)
└── public/             # Static files (CSV, YAML, JSON, PDF)
```

## Technology Stack

- **Next.js 14** with App Router and Turbopack
- **TypeScript** for type safety
- **Tailwind CSS** + **shadcn/ui** for styling
- **Zustand** for state management
- **Recharts** for data visualization
- **Lucide React** for icons

## Key Characteristics

- **100% Frontend**: No real APIs, no network calls, fully offline
- **Deterministic**: Seeded PRNG ensures consistent demo behavior
- **Easy to Customize**: Each page is self-contained and easy to modify

## Documentation

See [CLAUDE.md](./CLAUDE.md) for comprehensive architecture documentation and development guidelines.

## Modifying Content

Each page can be easily customized by editing its component file:

- **Page 1 (Setup)**: `components/pages/SetupPage.tsx`
- **Page 2 (Data)**: `components/pages/DataPage.tsx`
- **Page 3 (Fine-tune)**: `components/pages/FinetunePage.tsx`
- **Page 4 (Dashboard)**: `components/pages/DashboardPage.tsx`

## Available Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## Notes

- This is a **demo application** - no actual training or data processing occurs
- All progress is simulated with deterministic timers
- Perfect for showcasing workflows and UI/UX concepts
- Full walkthrough takes approximately 90 seconds
