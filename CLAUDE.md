# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **canned demo** of an LLM fine-tuning platform built with Next.js 14, TypeScript, and Tailwind CSS. The application is 100% frontend-only with no real backend, APIs, or network calls. All progress, data generation, and training are simulated using deterministic timers and local state management with Zustand.

**Purpose**: Showcase a synthetic data generation and LLM fine-tuning workflow with a polished UI for demonstrations.

## Tech Stack

- **Framework**: Next.js 14 (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand
- **Charts**: Recharts
- **Icons**: Lucide React

## Commands

### Development
```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Component Development
```bash
npx shadcn@latest add [component-name]    # Add new shadcn/ui components
```

## Architecture

### Application Flow

The application follows a **4-page wizard-style workflow**:

1. **Project Setup** (`setup`) - Intent classification model definition (chat-style UI with auto-loaded messages for e-commerce support with 356 intent categories)
2. **Data Setup** (`data`) - Upload or generate synthetic training data
3. **Fine-tuning** (`finetune`) - 4-step training wizard (auto-populated guidelines, output format checker, reasoning effort, latency SLA, data, parameters, training)
4. **Dashboard** (`dashboard`) - Results with metrics, charts, and comparisons

**Demo Scenario**: Intent classification for e-commerce customer support (Coupang-style) with 356 predefined intent categories, 95% SLA for intent accuracy, and multi-intent priority handling.

Navigation is handled via Zustand state (`project.currentPage`), not Next.js routing.

### UI Layout

- **Project Sidebar** (256px): Left sidebar showing project list (ChatGPT-style), New Project button, and utility actions (Help, Theme, Settings)
- **Global Header** (64px): Top bar with Workato logo (clickable to reset to Setup page)
- **Step Progress** (256px): Always visible, shows current workflow step across all pages
- **Main Content**: Responsive area for page content

### Directory Structure

```
finetune-platform/
├── app/
│   ├── layout.tsx              # Root layout (dark theme, Toaster)
│   ├── page.tsx                # Main page (renders PageRouter)
│   └── globals.css             # Global styles
├── components/
│   ├── layout/
│   │   ├── MainLayout.tsx      # App shell with header, sidebars, and content
│   │   ├── Sidebar.tsx         # Project list sidebar (ChatGPT-style with actions)
│   │   └── StepProgress.tsx    # Step tracker (always visible)
│   ├── pages/
│   │   ├── SetupPage.tsx       # Page 1: Chat-style policy setup
│   │   ├── DataPage.tsx        # Page 2: Data upload/generation
│   │   ├── FinetunePage.tsx    # Page 3: Training wizard
│   │   └── DashboardPage.tsx   # Page 4: Results & metrics
│   ├── ui/                     # shadcn/ui components (auto-generated)
│   └── PageRouter.tsx          # Routes between pages based on Zustand state
├── store/
│   └── useStore.ts             # Zustand store (all app state)
├── lib/
│   └── utils.ts                # Utilities (cn, seedRand PRNG)
└── public/                     # Static files (CSV, YAML, JSON, PDF)
```

### Key Features

#### 1. Auto-loaded Content
- **Page 1 (Setup)**: Intent classification guidelines automatically load on mount with staggered timing for e-commerce customer support scenario
- **Page 3 (Fine-tuning)**: Training guidelines auto-populate in Step 1 with intent classification rules, plus output format checker (Regex/JSON), reasoning effort selector (Low/Med/High), and latency SLA configuration

#### 2. Project Sidebar (ChatGPT-style)
- **Project List**: Shows multiple demo projects with names and dates
- **New Project Button**: Creates/resets to a new project (navigates to Setup)
- **Active Project**: Highlights currently selected project
- **Utility Actions**: Help, Theme Toggle, and Settings at the bottom
  - **Help**: Opens modal with demo information
  - **Theme Toggle**: Switches between dark/light mode (currently dark by default)
  - **Settings**: Opens modal with Deterministic Mode and Debug Timings toggles

#### 3. Branding
- **Workato Logo**: Displayed in global header, clickable to return to Setup page
- Located at `/public/workato-logo.svg`

### Key Patterns

#### 1. Client-Side Only Architecture
- **No real APIs**: All data is hardcoded or simulated
- **No network calls**: Everything runs in the browser
- **Deterministic randomness**: Uses seeded PRNG (`seedRand()`) for consistent demo behavior
- **Simulated async**: `setTimeout` with PRNG for fake progress bars and logs

#### 2. State Management (Zustand)

All application state lives in `store/useStore.ts`:

```typescript
// Main state sections:
- project          // Current page, guidelines
- dataset          // Uploaded/generated dataset info
- dataGenProgress  // DSR1/GPTOSS generation status
- trainingConfig   // Model, strategy, RLEF/RLAIF settings
- run              // Training progress, logs
- metrics          // Fixed GPT-4o vs trained model comparison
```

**Navigation**: Use `navigateTo(page)` instead of Next.js router:
```typescript
const { navigateTo } = useStore();
navigateTo('data'); // Go to data page
```

#### 3. Page Component Structure

Each page (`components/pages/*.tsx`) is a **self-contained client component**:
- Manages its own local UI state (not in Zustand)
- Reads/writes to Zustand for cross-page state
- Uses shadcn/ui components for consistent styling
- Dark theme styling with `zinc` color palette

#### 4. Simulated Progress

Use the seeded PRNG for deterministic timing:

```typescript
import { seedRand } from '@/lib/utils';

const rng = seedRand(42); // Seed for reproducibility

// Simulate multi-stage progress
STAGES.forEach((_, index) => {
  setTimeout(() => {
    setStage(index + 1);
  }, 2000 * (index + 1)); // Fixed 2s intervals
});
```

## Modifying Content

### Updating Page Content

Each page is easy to modify by editing its component file:

- **Page 1 (Setup)**: Edit `components/pages/SetupPage.tsx`
  - Modify `JOB_DESCRIPTION` for the intent classification model definition
  - Update `SIMPLE_PROMPT` and `DETAILED_PROMPT` for scenario-specific requirements
  - Current scenario: 356-category intent classification for e-commerce customer support (Coupang-style)
  - Adjust message delays for auto-scroll timing (500-2600ms intervals)

- **Page 2 (Data)**: Edit `components/pages/DataPage.tsx`
  - Change `DSR1_STAGES` and `GPTOSS_STAGES` for progress steps
  - Modify timings in `handleGenerate()`

- **Page 3 (Fine-tune)**: Edit `components/pages/FinetunePage.tsx`
  - Update `MODELS` array for model selection
  - Edit `TEMPLATE_GUIDELINES` for default guidelines (auto-populates on mount in Step 1)
  - Current guidelines focus on: intent classification, intent vs request distinction, multi-intent priority, keyword extraction, filtering irrelevant utterances
  - Configure output format checker: Regex pattern or JSON schema validation
  - Set reasoning effort level: Low (quick), Medium (balanced), High (deep analysis)
  - Define latency SLA in milliseconds for inference targets
  - Modify `TRAINING_LOGS` for training output

- **Page 4 (Dashboard)**: Edit `components/pages/DashboardPage.tsx`
  - Update `TRACE_DATA` for evaluation examples
  - Metrics are in Zustand store (`store/useStore.ts`)

**Important**: Page 1 (SetupPage) defines the job description which informs Page 3 Step 1 (FinetunePage) guidelines. Keep scenario alignment consistent across both pages.

### Changing Metrics

Edit `store/useStore.ts` to change baseline metrics:

```typescript
metrics: {
  gpt4o: { intent: 92, policy: 95, system: 87, p50: 350, cost: 0.6 },
  trained: { intent: 100, policy: 97, system: 97, p50: 180, cost: 0.1 },
}
```

### Adding Static Files

Place downloadable files in `public/`:
- `synthetic_sample.csv` - Sample dataset
- `config.yaml` - Training configuration
- `adapter.safetensors` - Model weights (placeholder)
- `metrics.csv` - Metrics export
- `evals.json` - Evaluation results
- `summary.pdf` - Summary report

Downloads are triggered via standard `<a>` element clicks in components.

## Styling Guidelines

### Dark Theme
- Background: `bg-black`, `bg-zinc-900`, `bg-zinc-950`
- Borders: `border-zinc-800`, `border-zinc-700`
- Text: `text-white`, `text-zinc-400` (secondary), `text-zinc-500` (tertiary)

### Common Patterns
```tsx
// Card container
<Card className="p-6 bg-zinc-800 border-zinc-700">

// Button variants
<Button className="bg-blue-600 hover:bg-blue-700">  // Primary
<Button variant="outline">                           // Secondary
<Button variant="ghost">                             // Tertiary

// Input/Textarea
<Input className="bg-zinc-900 border-zinc-700 focus:border-blue-500" />
```

### Icons
Use Lucide React icons:
```tsx
import { Home, Database, Zap, Download } from 'lucide-react';
```

## Common Tasks

### Adding a New Page

1. Create page component in `components/pages/NewPage.tsx`
2. Add page to Zustand state type in `store/useStore.ts`:
   ```typescript
   currentPage: 'setup' | 'data' | 'finetune' | 'dashboard' | 'newpage';
   ```
3. Add route in `components/PageRouter.tsx`
4. Add navigation icon to `components/layout/Sidebar.tsx`
5. Add step to `components/layout/StepProgress.tsx`

### Adding New Metrics

1. Update Zustand store types in `store/useStore.ts`
2. Add to initial `metrics` object
3. Display in `components/pages/DashboardPage.tsx`
4. Update `public/metrics.csv` and `public/evals.json`

### Modifying Training Simulation

Edit `components/pages/FinetunePage.tsx`:
- Adjust `TRAINING_LOGS` array for output
- Modify `setTimeout` timings (currently 300ms per log)
- Update progress calculation: `(index + 1) / TRAINING_LOGS.length * 100`

## Important Notes

- **This is a demo**: No real training, no actual data processing
- **Fully offline**: Works without internet (except initial npm install)
- **Deterministic**: Same seed = same behavior every time
- **No persistence**: Refresh = reset state (no localStorage)
- **Font handling**: Uses system fonts to avoid Next.js font loading issues

## Testing

Since this is a demo with no logic to test:
1. Run `npm run dev`
2. Manually walk through all 4 pages
3. Verify timings are smooth (~90 seconds total walkthrough)
4. Check all buttons, downloads, and interactions work
5. Ensure no console errors

## Troubleshooting

### Dev server won't start
```bash
killall node              # Kill any hanging processes
rm -rf .next              # Clear build cache
npm run dev               # Restart
```

### TypeScript errors
```bash
npm run lint              # Check for issues
```

### Components not found
```bash
npx shadcn@latest add [component-name]  # Re-add missing component
```

## Future Enhancements

If converting this demo to a real application:
1. Replace Zustand with real API calls
2. Add authentication/user management
3. Implement actual training job submission
4. Connect to real model serving endpoints
5. Add database for persistence
6. Implement real file uploads (not simulated)
7. Add error handling and loading states
8. Implement proper routing with Next.js pages
