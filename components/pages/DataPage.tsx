'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Sparkles, Download, AlertCircle, Check, ChevronRight } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { seedRand } from '@/lib/utils';

const GENERATION_STAGES = [
  { name: 'Loading seed examples', duration: 3500 },
  { name: 'Analyzing patterns and intents', duration: 6000 },
  { name: 'Generating persona variations', duration: 8000 },
  { name: 'Creating scenario templates', duration: 7500 },
  { name: 'Synthesizing conversations', duration: 12000 },
  { name: 'Applying quality filters', duration: 9000 },
  { name: 'Validating outputs', duration: 7000 },
  { name: 'Finalizing dataset', duration: 5000 }
];

// Sample personas from the 300 persona library
const SAMPLE_PERSONAS = [
  'Professional Customer Service Rep',
  'Empathetic Support Specialist',
  'Concise Technical Assistant',
  'Friendly Retail Expert',
  'Patient Problem Solver',
  'Detail-Oriented Analyst',
  'Warm & Welcoming Host',
  'Solution-Focused Advisor',
  'Understanding Listener',
  'Efficient Task Manager',
  'Knowledgeable Consultant',
  'Calm Crisis Handler',
  'Proactive Helper',
  'Courteous Professional',
  'Resourceful Troubleshooter',
  'Diplomatic Mediator',
  'Enthusiastic Guide',
  'Methodical Planner',
  'Adaptable Communicator',
  'Reliable Partner'
];

export function DataPage() {
  const [step, setStep] = useState<'seed' | 'configure' | 'generate'>('seed');
  const [seedUploaded, setSeedUploaded] = useState(false);
  const [seedUploading, setSeedUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState<'uploading' | 'parsing' | 'validating' | 'analyzing'>('uploading');
  const [seedFileName, setSeedFileName] = useState('');
  const [seedRows, setSeedRows] = useState(0);
  const [processedRows, setProcessedRows] = useState(0);

  // Generation config
  const [numSamples, setNumSamples] = useState('20000');
  const [diversityLevel, setDiversityLevel] = useState('high');
  const [qualityThreshold, setQualityThreshold] = useState('0.85');
  const [scenarioInstructions, setScenarioInstructions] = useState('');

  // Active personas during generation
  const [activePersonas, setActivePersonas] = useState<string[]>([]);

  // Generation state
  const [generating, setGenerating] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [showRetry, setShowRetry] = useState(false);
  const [complete, setComplete] = useState(false);
  const [samplesProcessed, setSamplesProcessed] = useState(0);

  // Pipeline progress tracking
  const [pipelineProgress, setPipelineProgress] = useState<{[key: string]: number}>({
    qwen3: 0,
    deepseek: 0,
    kimi: 0,
    gptoss120b: 0,
  });

  const { setDataset, navigateTo } = useStore();
  const rng = seedRand(42);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSeedFileName(file.name);
    setSeedUploading(true);
    setUploadProgress(0);
    setUploadStage('uploading');
    setProcessedRows(0);

    // Read file to count rows
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim() !== '');
      const rowCount = Math.max(1, lines.length - 1); // Subtract header row
      setSeedRows(rowCount);

      // Stage 1: Upload (0-30%) - 1.5s
      let currentProgress = 0;
      const uploadInterval = setInterval(() => {
        currentProgress += 3;
        if (currentProgress >= 30) {
          clearInterval(uploadInterval);
          setUploadProgress(30);

          // Stage 2: Parsing (30-55%) - 1.8s
          setUploadStage('parsing');
          let parseProgress = 30;
          const parseInterval = setInterval(() => {
            parseProgress += 2.5;
            setProcessedRows(Math.floor((parseProgress - 30) / 25 * rowCount));
            if (parseProgress >= 55) {
              clearInterval(parseInterval);
              setUploadProgress(55);

              // Stage 3: Validating (55-75%) - 1.2s
              setUploadStage('validating');
              let validateProgress = 55;
              const validateInterval = setInterval(() => {
                validateProgress += 3.3;
                if (validateProgress >= 75) {
                  clearInterval(validateInterval);
                  setUploadProgress(75);

                  // Stage 4: Analyzing (75-100%) - 1.5s
                  setUploadStage('analyzing');
                  let analyzeProgress = 75;
                  const analyzeInterval = setInterval(() => {
                    analyzeProgress += 2.5;
                    if (analyzeProgress >= 100) {
                      clearInterval(analyzeInterval);
                      setUploadProgress(100);

                      // Complete
                      setTimeout(() => {
                        setSeedUploading(false);
                        setSeedUploaded(true);
                      }, 600);
                    } else {
                      setUploadProgress(Math.floor(analyzeProgress));
                    }
                  }, 150);
                } else {
                  setUploadProgress(Math.floor(validateProgress));
                }
              }, 120);
            } else {
              setUploadProgress(Math.floor(parseProgress));
            }
          }, 180);
        } else {
          setUploadProgress(currentProgress);
        }
      }, 150);
    };
    reader.readAsText(file);
  };

  const handleSeedUpload = () => {
    document.getElementById('seed-file-input')?.click();
  };

  const handleStartGeneration = () => {
    setStep('generate');
    setGenerating(true);
    setCurrentStage(0);
    setShowRetry(false);
    setComplete(false);
    setActivePersonas([]);
    setSamplesProcessed(0);
    setPipelineProgress({ qwen3: 0, deepseek: 0, kimi: 0, gptoss120b: 0 });

    // Rotate through personas during generation
    const personaInterval = setInterval(() => {
      const randomPersonas = [];
      for (let i = 0; i < 5; i++) {
        const randomIndex = Math.floor(rng() * SAMPLE_PERSONAS.length);
        randomPersonas.push(SAMPLE_PERSONAS[randomIndex]);
      }
      setActivePersonas(randomPersonas);
    }, 800);

    // Increment samples processed counter with realistic pacing
    const samplesInterval = setInterval(() => {
      setSamplesProcessed(prev => {
        // Start slow, speed up in middle, slow down at end
        const progress = prev / parseInt(numSamples);
        let baseIncrement;

        if (progress < 0.15) {
          // Very slow start (warming up models)
          baseIncrement = 15 + rng() * 25;
        } else if (progress < 0.3) {
          // Ramping up
          baseIncrement = 35 + rng() * 45;
        } else if (progress < 0.75) {
          // Peak generation phase
          baseIncrement = 55 + rng() * 75;
        } else if (progress < 0.9) {
          // Slowing down (quality checks)
          baseIncrement = 30 + rng() * 40;
        } else {
          // Final validation (very slow)
          baseIncrement = 15 + rng() * 25;
        }

        const increment = Math.floor(baseIncrement);
        return Math.min(parseInt(numSamples), prev + increment);
      });
    }, 600);

    // Start pipelines with staggered delays for realism
    const pipelineIntervals: { [key: string]: NodeJS.Timeout } = {};

    // Qwen3 starts immediately - runs full duration
    setTimeout(() => {
      pipelineIntervals.qwen3 = setInterval(() => {
        setPipelineProgress(prev => ({
          ...prev,
          qwen3: Math.min(100, prev.qwen3 + (0.80 + rng() * 0.35))
        }));
      }, 600);
    }, 0);

    // DeepSeek starts 2000ms later - slightly faster to catch up
    setTimeout(() => {
      pipelineIntervals.deepseek = setInterval(() => {
        setPipelineProgress(prev => ({
          ...prev,
          deepseek: Math.min(100, prev.deepseek + (0.85 + rng() * 0.35))
        }));
      }, 600);
    }, 2000);

    // Kimi starts 3500ms later - faster to catch up
    setTimeout(() => {
      pipelineIntervals.kimi = setInterval(() => {
        setPipelineProgress(prev => ({
          ...prev,
          kimi: Math.min(100, prev.kimi + (0.85 + rng() * 0.40))
        }));
      }, 600);
    }, 3500);

    // GPT OSS 120B starts 5000ms later - fastest to catch up
    setTimeout(() => {
      pipelineIntervals.gptoss120b = setInterval(() => {
        setPipelineProgress(prev => ({
          ...prev,
          gptoss120b: Math.min(100, prev.gptoss120b + (0.90 + rng() * 0.40))
        }));
      }, 600);
    }, 5000);

    // Simulate realistic generation pipeline with variable stage durations
    const initDelay = 2500; // Initial "warming up" delay
    let cumulativeDelay = initDelay;

    GENERATION_STAGES.forEach((stage, index) => {
      cumulativeDelay += stage.duration;
      setTimeout(() => {
        setCurrentStage(index + 1);

        // Show retry banner occasionally during synthesis stage
        if (index === 4 && rng() < 0.15) {
          setShowRetry(true);
          setTimeout(() => setShowRetry(false), 4000);
        }
      }, cumulativeDelay);
    });

    // Calculate total duration including init delay
    const totalDuration = initDelay + GENERATION_STAGES.reduce((sum, stage) => sum + stage.duration, 0);

    // Complete after all stages
    setTimeout(() => {
      setComplete(true);
      setGenerating(false);
      clearInterval(personaInterval);
      clearInterval(samplesInterval);
      Object.values(pipelineIntervals).forEach(clearInterval);
      setActivePersonas([]);
      setSamplesProcessed(parseInt(numSamples));
      setPipelineProgress({ qwen3: 100, deepseek: 100, kimi: 100, gptoss120b: 100 });
      setDataset({
        name: 'synthetic-customer-support',
        rows: parseInt(numSamples),
        cols: 5,
        type: 'synthetic',
      });
    }, totalDuration + 1000);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/synthetic_sample.csv';
    link.download = 'synthetic_sample.csv';
    link.click();
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900">
      {/* Page Header */}
      <div className="border-b border-zinc-800 p-6 bg-zinc-950">
        <h1 className="text-2xl font-semibold">Data Setup</h1>
        <p className="text-zinc-400 mt-1">Upload seed examples and generate synthetic training data</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Progress Indicator */}
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${step === 'seed' ? 'text-[#00A99D]' : seedUploaded ? 'text-[#00A99D]' : 'text-zinc-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${seedUploaded ? 'bg-[#00A99D] text-white' : step === 'seed' ? 'bg-[#00A99D] text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                {seedUploaded ? <Check className="w-4 h-4" /> : '1'}
              </div>
              <span className="text-sm font-medium">Seed Examples</span>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-600" />
            <div className={`flex items-center gap-2 ${step === 'configure' ? 'text-[#00A99D]' : step === 'generate' ? 'text-[#00A99D]' : 'text-zinc-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step === 'generate' ? 'bg-[#00A99D] text-white' : step === 'configure' ? 'bg-[#00A99D] text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                {complete ? <Check className="w-4 h-4" /> : '2'}
              </div>
              <span className="text-sm font-medium">Configure & Generate</span>
            </div>
          </div>

          {/* Step 1: Upload Seed Examples */}
          {step === 'seed' && (
            <Card className="p-6 bg-zinc-800 border-zinc-700">
              {!seedUploaded && !seedUploading ? (
                <div className="text-center py-12">
                  <Upload className="w-16 h-16 mx-auto text-zinc-500 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Upload Seed Examples</h3>
                  <p className="text-zinc-400 mb-2">
                    Provide 50-200 example conversations to seed the synthetic data generation
                  </p>
                  <p className="text-xs text-zinc-500 mb-6">
                    Accepted formats: CSV, JSON, JSONL
                  </p>
                  <input
                    id="seed-file-input"
                    type="file"
                    accept=".csv,.json,.jsonl"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button onClick={handleSeedUpload} className="bg-[#00A99D] hover:bg-[#008c82]">
                    <Upload className="w-4 h-4 mr-2" />
                    Select File
                  </Button>
                </div>
              ) : seedUploading ? (
                <div className="py-12 space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 relative">
                      <div className="absolute inset-0 border-4 border-zinc-700 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-[#00A99D] rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      {uploadStage === 'uploading' && 'Uploading file...'}
                      {uploadStage === 'parsing' && 'Parsing CSV data...'}
                      {uploadStage === 'validating' && 'Validating format...'}
                      {uploadStage === 'analyzing' && 'Analyzing examples...'}
                    </h3>
                    <p className="text-zinc-400 mb-1">{seedFileName}</p>
                    <p className="text-sm text-zinc-500">
                      {uploadStage === 'uploading' && 'Transferring file to server'}
                      {uploadStage === 'parsing' && 'Processing CSV rows and columns'}
                      {uploadStage === 'validating' && 'Checking schema and data types'}
                      {uploadStage === 'analyzing' && 'Extracting intents and patterns'}
                    </p>
                  </div>
                  <div className="max-w-md mx-auto space-y-2">
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="text-xs text-zinc-400 text-center">{uploadProgress}%</p>
                  </div>
                </div>
              ) : seedUploaded ? (
                <div className="space-y-4">
                  <div className="p-4 bg-[#00A99D]/10 border border-[#00A99D]/30 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <Check className="w-5 h-5 text-[#00A99D]" />
                      <span className="font-semibold text-[#00A99D]">Seed examples uploaded successfully</span>
                    </div>
                    <p className="text-sm text-zinc-300 ml-8">
                      {seedFileName} • {seedRows} examples • 3 columns
                    </p>
                  </div>

                  <div className="p-4 bg-zinc-900 rounded-lg space-y-2">
                    <h4 className="text-sm font-semibold">Analysis Summary</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-zinc-400">Intents detected:</span>
                        <span className="text-white ml-2 font-medium">8</span>
                      </div>
                      <div>
                        <span className="text-zinc-400">Avg length:</span>
                        <span className="text-white ml-2 font-medium">156 tokens</span>
                      </div>
                      <div>
                        <span className="text-zinc-400">Format:</span>
                        <span className="text-white ml-2 font-medium">User-Assistant pairs</span>
                      </div>
                      <div>
                        <span className="text-zinc-400">Quality score:</span>
                        <span className="text-white ml-2 font-medium">94%</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => setStep('configure')}
                    className="w-full bg-[#00A99D] hover:bg-[#008c82]"
                  >
                    Continue to Configuration
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              ) : null}
            </Card>
          )}

          {/* Step 2: Configure Generation */}
          {step === 'configure' && !generating && !complete && (
            <div className="space-y-6">
              <Card className="p-6 bg-zinc-800 border-zinc-700 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Generation Configuration</h3>

                  {/* Persona Library Info */}
                  <div className="space-y-4">
                    <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-700">
                      <div className="flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-[#00A99D] mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold mb-1">Persona Library</h4>
                          <p className="text-sm text-zinc-300 mb-2">
                            Using <span className="text-[#00A99D] font-semibold">300 pre-configured personas</span> to generate diverse, contextually-appropriate responses
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {SAMPLE_PERSONAS.slice(0, 8).map((persona, i) => (
                              <span key={i} className="text-xs px-2 py-1 bg-zinc-800 rounded border border-zinc-700 text-zinc-400">
                                {persona}
                              </span>
                            ))}
                            <span className="text-xs px-2 py-1 bg-zinc-800 rounded border border-zinc-700 text-[#00A99D] font-medium">
                              +292 more
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium block mb-2">Scenario Instructions (Optional)</label>
                      <Textarea
                        value={scenarioInstructions}
                        onChange={(e) => setScenarioInstructions(e.target.value)}
                        placeholder="e.g., Include edge cases like urgent requests, international orders, VIP customers..."
                        className="bg-zinc-900 border-zinc-700 min-h-[80px]"
                      />
                      <p className="text-xs text-zinc-400 mt-1">Additional scenarios or edge cases to include in generation</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-zinc-800 border-zinc-700 space-y-4">
                <h3 className="text-lg font-semibold">Generation Parameters</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium block mb-2">Number of Samples</label>
                    <Select value={numSamples} onValueChange={setNumSamples}>
                      <SelectTrigger className="bg-zinc-900 border-zinc-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5000">5,000 samples</SelectItem>
                        <SelectItem value="10000">10,000 samples</SelectItem>
                        <SelectItem value="20000">20,000 samples</SelectItem>
                        <SelectItem value="50000">50,000 samples</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-2">Diversity Level</label>
                    <Select value={diversityLevel} onValueChange={setDiversityLevel}>
                      <SelectTrigger className="bg-zinc-900 border-zinc-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low - Conservative variations</SelectItem>
                        <SelectItem value="medium">Medium - Balanced variations</SelectItem>
                        <SelectItem value="high">High - Wide range of variations</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-2">Quality Threshold</label>
                    <Select value={qualityThreshold} onValueChange={setQualityThreshold}>
                      <SelectTrigger className="bg-zinc-900 border-zinc-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0.75">75% - More samples, lower quality</SelectItem>
                        <SelectItem value="0.85">85% - Balanced</SelectItem>
                        <SelectItem value="0.90">90% - Fewer samples, higher quality</SelectItem>
                        <SelectItem value="0.95">95% - Most strict</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-zinc-900 border-zinc-700">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-[#00A99D] mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Parallel Generation Pipeline</h4>
                    <p className="text-xs text-zinc-400 mb-2">
                      This will analyze your {seedRows} seed examples and generate <span className="text-[#00A99D] font-medium">~{parseInt(numSamples).toLocaleString()} conversations</span> using:
                    </p>
                    <ul className="text-xs text-zinc-400 space-y-0.5 ml-4">
                      <li>• <span className="text-[#00A99D] font-medium">4 parallel models</span> (Qwen3 235B, DeepSeek R1, Kimi K2, GPT OSS 120B)</li>
                      <li>• <span className="text-[#00A99D] font-medium">300 persona variations</span> for diversity</li>
                      <li>• Quality filtering and validation</li>
                    </ul>
                    <p className="text-xs text-zinc-500 mt-2">
                      Estimated time: ~38 seconds
                    </p>
                  </div>
                </div>
              </Card>

              <Button
                onClick={handleStartGeneration}
                className="w-full bg-[#00A99D] hover:bg-[#008c82]"
                size="lg"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Start Synthetic Data Generation
              </Button>
            </div>
          )}

          {/* Step 3: Generation Progress */}
          {(step === 'configure' || step === 'generate') && (generating || complete) && (
            <div className="space-y-6">
              {showRetry && (
                <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg animate-pulse">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  <div className="flex-1">
                    <p className="text-sm text-amber-200 font-medium">
                      Quality check triggered
                    </p>
                    <p className="text-xs text-amber-300 mt-0.5">
                      Regenerating low-quality samples from DSR1 pipeline... This is normal.
                    </p>
                  </div>
                </div>
              )}

              <Card className="p-6 bg-zinc-800 border-zinc-700">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Synthetic Data Generation</p>
                      <p className="text-sm text-zinc-400">
                        {currentStage === 0 ? (
                          <>0/{GENERATION_STAGES.length} - Initializing pipelines...</>
                        ) : (
                          <>{currentStage}/{GENERATION_STAGES.length} - {GENERATION_STAGES[currentStage - 1]?.name}</>
                        )}
                      </p>
                      {generating && GENERATION_STAGES[currentStage - 1] && (
                        <p className="text-xs text-zinc-500 mt-0.5">
                          Expected duration: {(GENERATION_STAGES[currentStage - 1].duration / 1000).toFixed(1)}s
                        </p>
                      )}
                    </div>
                    <span className="text-sm text-zinc-400">
                      {Math.round((currentStage / GENERATION_STAGES.length) * 100)}%
                    </span>
                  </div>
                  <Progress value={(currentStage / GENERATION_STAGES.length) * 100} />

                  {/* Parallel Pipeline Progress */}
                  {generating && currentStage >= 2 && (
                    <div className="pt-4 border-t border-zinc-700 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold">Parallel Generation Pipelines</h4>
                        <span className="text-xs text-zinc-400">4 models</span>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {/* Qwen3 Pipeline */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Qwen3 235B A22B Instruct</span>
                              <span className="text-zinc-500"></span>
                            </div>
                            {pipelineProgress.qwen3 === 0 && currentStage < 3 ? (
                              <span className="text-zinc-500">Initializing...</span>
                            ) : (
                              <span className="text-[#00A99D]">{Math.round(pipelineProgress.qwen3)}%</span>
                            )}
                          </div>
                          <Progress value={pipelineProgress.qwen3} className="h-1.5" />
                        </div>

                        {/* DeepSeek Pipeline */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">DeepSeek R1 0528</span>
                              <span className="text-zinc-500"></span>
                            </div>
                            {pipelineProgress.deepseek === 0 ? (
                              <span className="text-zinc-500">Waiting...</span>
                            ) : (
                              <span className="text-[#00A99D]">{Math.round(pipelineProgress.deepseek)}%</span>
                            )}
                          </div>
                          <Progress value={pipelineProgress.deepseek} className="h-1.5" />
                        </div>

                        {/* Kimi Pipeline */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Kimi K2 Thinking</span>
                              <span className="text-zinc-500"></span>
                            </div>
                            {pipelineProgress.kimi === 0 ? (
                              <span className="text-zinc-500">Waiting...</span>
                            ) : (
                              <span className="text-[#00A99D]">{Math.round(pipelineProgress.kimi)}%</span>
                            )}
                          </div>
                          <Progress value={pipelineProgress.kimi} className="h-1.5" />
                        </div>

                        {/* GPT OSS 120B Pipeline */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">OpenAI GPT OSS 120B</span>
                              <span className="text-zinc-500"></span>
                            </div>
                            {pipelineProgress.gptoss120b === 0 ? (
                              <span className="text-zinc-500">Waiting...</span>
                            ) : (
                              <span className="text-[#00A99D]">{Math.round(pipelineProgress.gptoss120b)}%</span>
                            )}
                          </div>
                          <Progress value={pipelineProgress.gptoss120b} className="h-1.5" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Generation Stats */}
                  {generating && currentStage >= 4 && (
                    <div className="space-y-4 pt-4 border-t border-zinc-700">
                      {/* Active Personas */}
                      {activePersonas.length > 0 && currentStage >= 5 && (
                        <div className="p-3 bg-zinc-900/50 rounded-lg border border-zinc-700">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-zinc-400 font-medium">Active Personas</span>
                            <span className="text-xs text-[#00A99D] font-medium">Using 300 from library</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {activePersonas.map((persona, i) => (
                              <span key={i} className="text-xs px-2 py-0.5 bg-[#00A99D]/10 rounded border border-[#00A99D]/30 text-[#00A99D] animate-pulse">
                                {persona}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>

              {complete && (
                <div className="space-y-4">
                  <Card className="p-4 bg-[#00A99D]/10 border-[#00A99D]/30">
                    <div className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-[#00A99D]" />
                      <div>
                        <p className="text-[#00A99D] font-medium">Synthetic dataset generated successfully</p>
                        <p className="text-sm text-zinc-300 mt-1">
                          {parseInt(numSamples).toLocaleString()} samples• 4 parallel models • 300 personas • Quality: 92%
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 bg-zinc-800 border-zinc-700 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">synthetic-customer-support.csv</p>
                        <p className="text-sm text-zinc-400">{parseInt(numSamples).toLocaleString()} rows</p>
                      </div>
                      <Button onClick={handleDownload} variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download Sample
                      </Button>
                    </div>
                    <div className="pt-3 border-t border-zinc-700">
                      <p className="text-xs text-zinc-400 mb-2">Pipeline Contributions:</p>
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div className="text-center p-2 bg-zinc-900 rounded">
                          <div className="font-medium text-[#00A99D]">{Math.floor(parseInt(numSamples) * 0.28).toLocaleString()}</div>
                          <div className="text-zinc-500">DSR1</div>
                        </div>
                        <div className="text-center p-2 bg-zinc-900 rounded">
                          <div className="font-medium text-[#00A99D]">{Math.floor(parseInt(numSamples) * 0.26).toLocaleString()}</div>
                          <div className="text-zinc-500">GPTOSS</div>
                        </div>
                        <div className="text-center p-2 bg-zinc-900 rounded">
                          <div className="font-medium text-[#00A99D]">{Math.floor(parseInt(numSamples) * 0.24).toLocaleString()}</div>
                          <div className="text-zinc-500">Claude</div>
                        </div>
                        <div className="text-center p-2 bg-zinc-900 rounded">
                          <div className="font-medium text-[#00A99D]">{Math.floor(parseInt(numSamples) * 0.22).toLocaleString()}</div>
                          <div className="text-zinc-500">Gemini</div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Button
                    onClick={() => navigateTo('finetune')}
                    className="w-full bg-[#00A99D] hover:bg-[#008c82]"
                    size="lg"
                  >
                    Continue to Training
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
