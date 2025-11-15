'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Check, Plus, X, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore, Guideline } from '@/store/useStore';
import { cn, seedRand } from '@/lib/utils';
import { toast } from 'sonner';

const MODELS = [
  { name: 'OpenAI gpt-oss-20b', color: 'bg-amber-500' },
  { name: 'OpenAI gpt-oss-120b', color: 'bg-orange-500' },
  { name: 'Qwen3-14B', color: 'bg-fuchsia-500' },
  { name: 'Qwen3 235B A22B Instruct', color: 'bg-pink-500'},
  { name: 'Llama 3.1 8B Instruct', color: 'bg-sky-500' },
  { name: 'DeepSeek R1 0528', color: 'bg-violet-500' },
  { name: 'DeepSeek V3.1 Terminus', color: 'bg-purple-500' },
  { name: 'Kimi K2 Thinking', color: 'bg-teal-500' },
  { name: 'Kimi K2 Instruct 0905', color: 'bg-blue-500' },
  { name: 'MiniMax M2', color: 'bg-rose-500' },
  { name: 'GLM-4.6', color: 'bg-green-500' },
];
// 25 23 27  for judges

const TEMPLATE_GUIDELINES: Guideline[] = [
  {
    id: 'analysis_output',
    text: 'Always structure your response with <analysis> tags containing your reasoning process, followed by <intent> tags with the classified intent(s).'
  },
  {
    id: 'intent_classification',
    text: 'Classify customer utterances into one of 356 predefined intent categories. Reference the comprehensive intent classification table and hierarchical structure (depth1~4) for accurate categorization.'
  },
  {
    id: 'intent_vs_request',
    text: 'Distinguish between customer intent (root cause of inquiry) and request (desired action). Always prioritize identifying the underlying intent over the surface-level request.'
  },
  {
    id: 'multi_intent_priority',
    text: 'When multiple intents are detected in a single utterance, apply priority hierarchy: P1 (primary intent) > P2 (secondary intent). Focus on the root cause over related topics.'
  },
  {
    id: 'keyword_extraction',
    text: 'Detect and extract critical keywords including Intent_tags. Pay attention to domain-specific terminology: Coupang Eats, Coupang Play, WOW Membership, Rocket Mobile.'
  },
  {
    id: 'filter_irrelevant',
    text: 'Filter out irrelevant utterances including simple acknowledgments (OK, thanks), feedback without actionable intent, and reactions. These should not be classified as having intent.'
  },
  {
    id: 'accuracy_target',
    text: 'Maintain 95%+ accuracy for intent detection and 90%+ for request classification. Flag ambiguous cases and provide confidence scores when multiple intents are possible.'
  },
  {
    id: 'context_awareness',
    text: 'Consider complete utterance context including temporal sequencing. For physical defects/damage, prioritize vendor-responsibility. Never rely solely on keyword matching without understanding full context.'
  },
];

const generateTrainingLogs = (modelName: string) => [
  'Loading training data...',
  `Initializing model: ${modelName}`,
  'Setting up GRPO optimizer',
  'Configuring reward model: Kimi K2 Thinking',
  'Warmup: training_step 1/100 - loss=3.42',
  'Warmup: training_step 10/100 - loss=3.15',
  'Warmup: training_step 25/100 - loss=2.87',
  'Warmup: training_step 40/100 - loss=2.52',
  'Warmup: training_step 50/100 - loss=2.31',
  'Warmup: training_step 65/100 - loss=2.11',
  'Warmup: training_step 75/100 - loss=1.98',
  'Warmup: training_step 90/100 - loss=1.85',
  'Warmup: training_step 100/100 - loss=1.76',
  'Training: training_step 1/2000 - loss=1.76, reward=0.12',
  'Training: training_step 50/2000 - loss=1.89, reward=0.18 - intent_acc=74%',
  'Training: training_step 100/2000 - loss=1.52, reward=0.31 - intent_acc=85%',
  'Training: training_step 150/2000 - loss=1.71, reward=0.25 - intent_acc=82%',
  'Training: training_step 200/2000 - loss=1.38, reward=0.42 - intent_acc=92%',
  'Eval checkpoint: intent=95%',
  'Training: training_step 250/2000 - loss=1.45, reward=0.38 - intent_acc=90%',
  'Training: training_step 300/2000 - loss=1.21, reward=0.51 - intent_acc=96%',
  'Training: training_step 350/2000 - loss=1.34, reward=0.47 - intent_acc=94%',
  'Training: training_step 400/2000 - loss=1.08, reward=0.59 - intent_acc=97%',
  'Eval checkpoint: intent=98%',
  'Training: training_step 450/2000 - loss=1.15, reward=0.55 - intent_acc=96%',
  'Training: training_step 500/2000 - loss=0.95, reward=0.68 - intent_acc=98%',
  'Training: training_step 550/2000 - loss=1.03, reward=0.62 - intent_acc=97%',
  'Training: training_step 600/2000 - loss=0.87, reward=0.74 - intent_acc=99%',
  'Eval checkpoint: intent=99%',
  'Training: training_step 650/2000 - loss=0.92, reward=0.71 - intent_acc=98%',
  'Training: training_step 700/2000 - loss=0.79, reward=0.81 - intent_acc=99%',
  'Training: training_step 750/2000 - loss=0.84, reward=0.77 - intent_acc=99%',
  'Training: training_step 800/2000 - loss=0.73, reward=0.86 - intent_acc=100%',
  'Eval checkpoint: intent=100%',
  'Training: training_step 850/2000 - loss=0.76, reward=0.84 - intent_acc=99%',
  'Training: training_step 900/2000 - loss=0.69, reward=0.89 - intent_acc=100%',
  'Training: training_step 950/2000 - loss=0.71, reward=0.87 - intent_acc=100%',
  'Training: training_step 1000/2000 - loss=0.67, reward=0.91 - intent_acc=100%',
  'Eval checkpoint: intent=100%',
  'Training: training_step 1100/2000 - loss=0.64, reward=0.93 - intent_acc=100%',
  'Training: training_step 1200/2000 - loss=0.61, reward=0.95 - intent_acc=100%',
  'Training: training_step 1300/2000 - loss=0.59, reward=0.96 - intent_acc=100%',
  'Training: training_step 1400/2000 - loss=0.57, reward=0.97 - intent_acc=100%',
  'Eval checkpoint: intent=100%',
  'Training: training_step 1500/2000 - loss=0.55, reward=0.98 - intent_acc=100%',
  'Training: training_step 1600/2000 - loss=0.53, reward=0.98 - intent_acc=100%',
  'Training: training_step 1700/2000 - loss=0.52, reward=0.99 - intent_acc=100%',
  'Training: training_step 1800/2000 - loss=0.51, reward=0.99 - intent_acc=100%',
  'Training: training_step 1900/2000 - loss=0.50, reward=0.99 - intent_acc=100%',
  'Training: training_step 2000/2000 - loss=0.49, reward=1.00 - intent_acc=100%',
  'Final eval: intent=100%',
  'Saving checkpoint: model_final.safetensors',
  'Saving adapter: adapter.safetensors',
  'Saving config: config.yaml',
  'Training complete!',
];

export function FinetunePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [guidelines, setGuidelines] = useState<Guideline[]>([]);
  const [newGuideline, setNewGuideline] = useState('');
  const [selectedDataset, setSelectedDataset] = useState('customer-support-training');
  const [selectedModel, setSelectedModel] = useState('DeepSeek V3.1 Terminus');
  const [strategies, setStrategies] = useState<string[]>(['RL']);
  const [algorithms, setAlgorithms] = useState<string[]>(['GRPO']);
  const [rlefRegex, setRlefRegex] = useState('<intent>(.*?)</intent>');
  const [outputFormat, setOutputFormat] = useState<'regex' | 'json'>('regex');
  const [reasoningEffort, setReasoningEffort] = useState<'low' | 'medium' | 'high'>('medium');
  const [latencySLA, setLatencySLA] = useState('500');
  const [training, setTraining] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [trainingComplete, setTrainingComplete] = useState(false);

  const { navigateTo, setTrainingConfig, trainingConfig } = useStore();
  const rng = seedRand(123);

  // Auto-populate guidelines on mount
  useEffect(() => {
    if (guidelines.length === 0) {
      setGuidelines(TEMPLATE_GUIDELINES);
    }
  }, []);

  const addGuideline = () => {
    if (!newGuideline.trim()) return;
    const newId = `guideline_${Date.now()}`;
    setGuidelines([...guidelines, { id: newId, text: newGuideline }]);
    setNewGuideline('');
  };

  const removeGuideline = (id: string) => {
    setGuidelines(guidelines.filter((g) => g.id !== id));
  };

  const loadTemplate = () => {
    setGuidelines(TEMPLATE_GUIDELINES);
  };

  const startTraining = () => {
    setTraining(true);
    setTrainingProgress(0);
    setLogs([]);
    setTrainingComplete(false);

    // Save training config to store
    setTrainingConfig({
      model: selectedModel,
      dataset: selectedDataset,
      aiJudge: trainingConfig.aiJudge,
      strategies: strategies,
    });

    // Simulate training with logs
    const trainingLogs = generateTrainingLogs(selectedModel);
    trainingLogs.forEach((log, index) => {
      setTimeout(() => {
        setLogs((prev) => [...prev, log]);
        setTrainingProgress(((index + 1) / trainingLogs.length) * 100);

        if (index === trainingLogs.length - 1) {
          setTrainingComplete(true);
          setTraining(false);
          toast.success('Training complete! Ready to view results.');
        }
      }, 400 * (index + 1));
    });
  };

  const handleDownload = (filename: string) => {
    const link = document.createElement('a');
    link.href = `/${filename}`;
    link.download = filename;
    link.click();
  };

  const canProceedStep1 = guidelines.length > 0;
  const canProceedStep2 = selectedDataset;
  const canProceedStep3 = selectedModel;

  return (
    <div className="flex h-full bg-zinc-900">
      {/* Left Stepper */}
      <div className="w-80 border-r border-zinc-800 p-6 bg-zinc-950">
        <h2 className="text-sm font-semibold text-zinc-400 mb-6 uppercase tracking-wide">
          Training Wizard
        </h2>
        <div className="space-y-4">
          {[
            { num: 1, title: 'Training Guidelines' },
            { num: 2, title: 'Training Data' },
            { num: 3, title: 'Training Parameters' },
            { num: 4, title: 'Review & Train' },
          ].map((step) => {
            const isActive = currentStep === step.num;
            const isCompleted = currentStep > step.num;

            return (
              <button
                key={step.num}
                onClick={() => setCurrentStep(step.num)}
                className={cn(
                  'w-full text-left flex items-center space-x-3 p-3 rounded-lg transition-colors',
                  isActive && 'bg-zinc-800',
                  !isActive && 'hover:bg-zinc-900'
                )}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold',
                    isActive && 'bg-[#00A99D] text-white',
                    isCompleted && 'bg-[#00A99D] text-white',
                    !isActive && !isCompleted && 'bg-zinc-800 text-zinc-400'
                  )}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : step.num}
                </div>
                <span
                  className={cn(
                    'font-medium',
                    isActive && 'text-white',
                    !isActive && 'text-zinc-400'
                  )}
                >
                  {step.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Step 1: Guidelines */}
            {currentStep === 1 && (
              <>
                <div>
                  <h1 className="text-2xl font-semibold mb-2">Training Guidelines</h1>
                  <p className="text-zinc-400">
                    Define guidelines that the AI judge will use to evaluate model responses
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button onClick={loadTemplate} variant="outline" size="sm">
                    Intent Classification
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    Follow document context
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    Improve Text2SQL
                  </Button>
                </div>

                <Card className="p-6 bg-zinc-800 border-zinc-700">
                  <div className="space-y-4">
                    <div className="text-sm font-medium text-zinc-300 mb-2">Evaluation Guidelines</div>
                    {guidelines.map((guideline) => (
                      <div
                        key={guideline.id}
                        className="flex items-start gap-3 p-3 bg-zinc-900 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="text-xs text-zinc-500 mb-1">{guideline.id}</div>
                          <p className="text-sm">{guideline.text}</p>
                        </div>
                        <button
                          onClick={() => removeGuideline(guideline.id)}
                          className="text-zinc-500 hover:text-red-400"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                    <div className="flex gap-2">
                      <Input
                        value={newGuideline}
                        onChange={(e) => setNewGuideline(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addGuideline()}
                        placeholder="Add new guideline... (Ctrl+N)"
                        className="flex-1 bg-zinc-900 border-zinc-700"
                      />
                      <Button onClick={addGuideline} size="icon">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-zinc-800 border-zinc-700 space-y-6">
                  <div>
                    <label className="text-sm font-medium mb-3 block">Expected Output Format Checker</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setOutputFormat('regex')}
                        className={cn(
                          'p-4 rounded-lg border-2 transition-all text-left',
                          outputFormat === 'regex'
                            ? 'border-[#00A99D] bg-[#00A99D]/10'
                            : 'border-zinc-700 bg-zinc-900 hover:border-zinc-600'
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Regex Pattern</span>
                          {outputFormat === 'regex' && (
                            <Check className="w-4 h-4 text-[#00A99D]" />
                          )}
                        </div>
                        <p className="text-xs text-zinc-400">Extract intent using regex pattern matching</p>
                      </button>
                      <button
                        onClick={() => setOutputFormat('json')}
                        className={cn(
                          'p-4 rounded-lg border-2 transition-all text-left',
                          outputFormat === 'json'
                            ? 'border-[#00A99D] bg-[#00A99D]/10'
                            : 'border-zinc-700 bg-zinc-900 hover:border-zinc-600'
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">JSON Schema</span>
                          {outputFormat === 'json' && (
                            <Check className="w-4 h-4 text-[#00A99D]" />
                          )}
                        </div>
                        <p className="text-xs text-zinc-400">Validate structured JSON output format</p>
                      </button>
                    </div>

                    {outputFormat === 'regex' && (
                      <div className="mt-4">
                        <label className="text-sm text-zinc-400 mb-2 block">Regex Pattern</label>
                        <Input
                          value={rlefRegex}
                          onChange={(e) => setRlefRegex(e.target.value)}
                          placeholder="e.g., <intent>(.*?)</intent>"
                          className="font-mono text-sm bg-zinc-900 border-zinc-700"
                        />
                      </div>
                    )}

                    {outputFormat === 'json' && (
                      <div className="mt-4">
                        <label className="text-sm text-zinc-400 mb-2 block">JSON Schema Preview</label>
                        <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-700 font-mono text-xs text-zinc-400">
                          {`{\n  "intent": "string",\n  "confidence": "number",\n  "keywords": ["string"]\n}`}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-3 block">Reasoning Effort</label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['low', 'medium', 'high'] as const).map((level) => (
                        <button
                          key={level}
                          onClick={() => setReasoningEffort(level)}
                          className={cn(
                            'p-4 rounded-lg border-2 transition-all text-center',
                            reasoningEffort === level
                              ? 'border-[#00A99D] bg-[#00A99D]/10'
                              : 'border-zinc-700 bg-zinc-900 hover:border-zinc-600'
                          )}
                        >
                          <div className="flex items-center justify-center mb-2">
                            <span className="font-medium capitalize">{level}</span>
                          </div>
                          {reasoningEffort === level && (
                            <Check className="w-4 h-4 text-[#00A99D] mx-auto" />
                          )}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-zinc-400 mt-3">
                      {reasoningEffort === 'low' && 'Quick classification with minimal chain-of-thought reasoning'}
                      {reasoningEffort === 'medium' && 'Balanced approach with moderate reasoning depth'}
                      {reasoningEffort === 'high' && 'Deep analysis with extensive chain-of-thought reasoning'}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-3 block">Reasoning Latency SLA</label>
                    <div className="flex items-center gap-4">
                      <Input
                        type="number"
                        value={latencySLA}
                        onChange={(e) => setLatencySLA(e.target.value)}
                        placeholder="500"
                        className="flex-1 bg-zinc-900 border-zinc-700"
                      />
                      <span className="text-sm text-zinc-400">milliseconds</span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-2">
                      Target latency for inference. Higher reasoning effort may require higher latency SLA.
                    </p>
                  </div>
                </Card>
              </>
            )}

            {/* Step 2: Training Data */}
            {currentStep === 2 && (
              <>
                <div>
                  <h1 className="text-2xl font-semibold mb-2">Training Data</h1>
                  <p className="text-zinc-400">Select dataset and AI judge for feedback</p>
                </div>

                <Card className="p-6 bg-zinc-800 border-zinc-700 space-y-6">
                  <div>
                    <label className="text-sm font-medium mb-3 block">Data Source</label>
                    <RadioGroup value="dataset" className="space-y-3">
                      <div className="flex items-center space-x-3 p-4 bg-zinc-900 rounded-lg opacity-50">
                        <RadioGroupItem value="prompts" id="prompts" disabled />
                        <label htmlFor="prompts" className="flex-1 cursor-not-allowed">
                          <p className="font-medium">Train on existing prompts</p>
                          <p className="text-sm text-zinc-500">Use production logs (coming soon)</p>
                        </label>
                      </div>
                      <div className="flex items-center space-x-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                        <RadioGroupItem value="dataset" id="dataset" />
                        <label htmlFor="dataset" className="flex-1 cursor-pointer">
                          <p className="font-medium">Use dataset</p>
                          <p className="text-sm text-zinc-400">Upload or generate synthetic data</p>
                        </label>
                      </div>
                    </RadioGroup>
                  </div>

                  {isMounted ? (
                    <div>
                      <label className="text-sm font-medium mb-3 block">Select Dataset</label>
                      <Select value={selectedDataset} onValueChange={setSelectedDataset}>
                        <SelectTrigger className="bg-zinc-900 border-zinc-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="customer-support-training">
                            customer-support-training (20000 rows)
                          </SelectItem>
                          <SelectItem value="customer-support-validation">
                            customer-support-validation (5000 rows)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div>
                      <label className="text-sm font-medium mb-3 block">Select Dataset</label>
                      <div className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm">
                        {selectedDataset || 'Select a dataset'}
                      </div>
                    </div>
                  )}

                </Card>
              </>
            )}

            {/* Step 3: Parameters */}
            {currentStep === 3 && (
              <>
                <div>
                  <h1 className="text-2xl font-semibold mb-2">Training Parameters & Model</h1>
                  <p className="text-zinc-400">Configure model and training strategy</p>
                </div>

                <Card className="p-6 bg-zinc-800 border-zinc-700 space-y-6">
                  <div>
                    <label className="text-sm font-medium mb-3 block">Select Model</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {MODELS.map((model) => (
                        <button
                          key={model.name}
                          onClick={() => setSelectedModel(model.name)}
                          className={cn(
                            'relative p-3 rounded-lg border-2 transition-all text-left',
                            selectedModel === model.name
                              ? 'border-[#00A99D] bg-[#00A99D]/10'
                              : 'border-zinc-700 bg-zinc-900 hover:border-zinc-600'
                          )}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <div className={cn('w-2 h-2 rounded-full flex-shrink-0', model.color)} />
                              <span className="text-sm font-medium">{model.name}</span>
                            </div>
                            {selectedModel === model.name && (
                              <Check className="w-4 h-4 text-[#00A99D] flex-shrink-0" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-3 block">Training Strategy (select one or more)</label>
                    <div className="space-y-3">
                      {['SFT', 'RL', 'OPD'].map((s) => (
                        <div key={s} className="flex items-center space-x-3">
                          <Checkbox
                            id={s}
                            checked={strategies.includes(s)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setStrategies([...strategies, s]);
                              } else {
                                setStrategies(strategies.filter(str => str !== s));
                              }
                            }}
                          />
                          <label htmlFor={s} className="cursor-pointer text-sm">
                            {s === 'SFT' && 'Supervised Fine-Tuning'}
                            {s === 'RL' && 'Reinforcement Learning'}
                            {s === 'OPD' && 'On-Policy Distillation'}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </>
            )}

            {/* Step 4: Review & Train */}
            {currentStep === 4 && (
              <>
                <div>
                  <h1 className="text-2xl font-semibold mb-2">Review & Start Training</h1>
                  <p className="text-zinc-400">Verify configuration and start training</p>
                </div>

                <Card className="p-6 bg-zinc-800 border-zinc-700 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-zinc-400">Dataset</p>
                      <p className="font-medium">{selectedDataset}</p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400">AI Judge</p>
                      <p className="font-medium">{trainingConfig.aiJudge}</p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400">Model</p>
                      <p className="font-medium">{selectedModel}</p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400">Strategy</p>
                      <p className="font-medium">{strategies.join(' + ')} - {algorithms.join(', ')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400">Guidelines</p>
                      <p className="font-medium">{guidelines.length} RLAIF rules</p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400">Output Format</p>
                      <p className="font-medium capitalize">{outputFormat}</p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400">RLEF Pattern</p>
                      <p className="font-mono text-xs">{outputFormat === 'regex' ? rlefRegex : 'JSON Schema'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400">Reasoning Effort</p>
                      <p className="font-medium capitalize">{reasoningEffort}</p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400">Latency SLA</p>
                      <p className="font-medium">{latencySLA}ms</p>
                    </div>
                  </div>
                </Card>

                {!training && !trainingComplete && (
                  <Button
                    onClick={startTraining}
                    className="w-full bg-[#00A99D] hover:bg-[#008c82]"
                    size="lg"
                  >
                    Start Training
                  </Button>
                )}

                {(training || trainingComplete) && (
                  <Card className="p-6 bg-zinc-800 border-zinc-700 space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold">Training Progress</p>
                        <span className="text-sm text-zinc-400">
                          {Math.round(trainingProgress)}%
                        </span>
                      </div>
                      <Progress value={trainingProgress} />
                    </div>

                    <div className="bg-black p-4 rounded-lg h-64 overflow-y-auto font-mono text-xs">
                      {logs.map((log, i) => (
                        <div key={i} className="text-green-400">
                          {log}
                        </div>
                      ))}
                    </div>

                    {trainingComplete && (
                      <div className="flex gap-3">
                        <Button
                          onClick={() => handleDownload('config.yaml')}
                          variant="outline"
                          size="sm"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          config.yaml
                        </Button>
                        <Button
                          onClick={() => handleDownload('adapter.safetensors')}
                          variant="outline"
                          size="sm"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          adapter.safetensors
                        </Button>
                      </div>
                    )}
                  </Card>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="border-t border-zinc-800 p-6 bg-zinc-950">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              variant="outline"
              disabled={currentStep === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="text-sm text-zinc-400">
              Step {currentStep} of 4
            </div>

            {currentStep < 4 ? (
              <Button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={
                  (currentStep === 1 && !canProceedStep1) ||
                  (currentStep === 2 && !canProceedStep2) ||
                  (currentStep === 3 && !canProceedStep3)
                }
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={() => navigateTo('dashboard')}
                disabled={!trainingComplete}
                className="bg-[#00A99D] hover:bg-[#008c82]"
              >
                View Results
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
