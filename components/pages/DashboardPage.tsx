'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, RotateCcw, TrendingUp, TrendingDown } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { seedRand } from '@/lib/utils';

// Add SUPER realistic noise and spikes to training data (like real RL training!)
const rng = seedRand(123);
const addNoise = (value: number, scale: number, progress: number, allowSpikes: boolean = true, minValue: number = 0) => {
  // Spikiness decreases as training progresses (converges at the end)
  // Very spiky at start (0-40%), medium in middle (40-70%), stable at end (70-100%)
  let spikinessMultiplier;
  if (progress < 0.4) {
    spikinessMultiplier = 1.8; // Very spiky at start
  } else if (progress < 0.7) {
    spikinessMultiplier = 1.2; // Medium spiky in middle
  } else {
    spikinessMultiplier = 0.4; // Converged at end
  }

  // Base noise decreases with progress
  const baseNoise = (rng() - 0.5) * scale * 2.0 * spikinessMultiplier;

  // Spikes more frequent early, rare late
  const spikeChance = allowSpikes ? (0.35 - progress * 0.25) : 0;
  const spike = rng() < spikeChance ? (rng() - 0.5) * scale * 5 * spikinessMultiplier : 0;

  // Extreme outliers only in early/middle training
  const outlierChance = allowSpikes && progress < 0.6 ? 0.08 : 0;
  const outlier = rng() < outlierChance ? (rng() - 0.5) * scale * 8 * spikinessMultiplier : 0;

  return Math.max(minValue, value + baseNoise + spike + outlier);
};

// Training curves data for RL metrics with MUCH MORE data points for spikiness
const generateBaseCurves = () => {
  const curves = [];
  for (let training_step = 0; training_step <= 2000; training_step += 50) {
    // Smooth downward trend for loss
    const lossBase = 2.45 * Math.exp(-training_step / 720);
    // Smooth upward trend for reward
    const rewardBase = 1.07 * (1 - Math.exp(-training_step / 720));
    // Smooth upward trend for accuracy
    const accuracyBase = 72 + 26 * (1 - Math.exp(-training_step / 720));

    curves.push({
      training_step,
      loss: Math.max(0.15, lossBase),
      reward: Math.min(1.07, rewardBase),
      accuracy: Math.min(98, Math.round(accuracyBase)),
      policyLoss: Math.max(0.10, lossBase * 0.7),
      valueLoss: Math.max(0.08, lossBase * 0.35),
    });
  }
  return curves;
};

const BASE_CURVES = generateBaseCurves();

// Add SUPER SPIKY realistic noise to create training curves
const TRAINING_CURVES = BASE_CURVES.map((point, index) => {
  const progress = point.training_step / 2000; // 0 to 1
  return {
    training_step: point.training_step,
    loss: parseFloat(addNoise(point.loss, 0.15, progress, true, 0.15).toFixed(3)), // Min loss 0.15
    reward: parseFloat(addNoise(point.reward, 0.08, progress, true, 0.0).toFixed(3)),
    accuracy: Math.round(addNoise(point.accuracy, 2.5, progress, false, 0)),
    policyLoss: parseFloat(addNoise(point.policyLoss, 0.12, progress, true, 0.10).toFixed(3)), // Min 0.10
    valueLoss: parseFloat(addNoise(point.valueLoss, 0.06, progress, true, 0.08).toFixed(3)), // Min 0.08
  };
});

// Generate more dense data for KL divergence
const generateKLData = () => {
  const data = [];
  for (let training_step = 0; training_step <= 2000; training_step += 50) {
    const klBase = 0.24 * (1 - Math.exp(-training_step / 600));
    data.push({
      training_step,
      kl: Math.max(0.01, Math.min(0.30, klBase)),
    });
  }
  return data;
};

const KL_DIVERGENCE_DATA = generateKLData().map((point, index) => {
  const progress = point.training_step / 2000;
  return {
    training_step: point.training_step,
    kl: parseFloat(addNoise(point.kl, 0.025, progress, true, 0.01).toFixed(3)),
  };
});

// Generate more dense data for reward intent match
const generateRewardIntentData = () => {
  const data = [];
  for (let training_step = 0; training_step <= 2000; training_step += 50) {
    const rewardBase = 0.60 + 0.20 * (1 - Math.exp(-training_step / 720));
    data.push({
      training_step,
      reward: Math.min(0.85, rewardBase),
    });
  }
  return data;
};

const REWARD_INTENT_MATCH_DATA = generateRewardIntentData().map((point, index) => {
  const progress = point.training_step / 2000;
  return {
    training_step: point.training_step,
    reward: parseFloat(addNoise(point.reward, 0.04, progress, true, 0.0).toFixed(3)),
  };
});

// Generate more dense data for sampling logp
const generateLogPData = () => {
  const data = [];
  for (let training_step = 0; training_step <= 2000; training_step += 50) {
    const logpBase = 0.010 + 0.030 * (1 - Math.exp(-training_step / 720));
    data.push({
      training_step,
      logp: Math.min(0.045, logpBase),
    });
  }
  return data;
};

const SAMPLING_LOGP_DIFF_DATA = generateLogPData().map((point, index) => {
  const progress = point.training_step / 2000;
  return {
    training_step: point.training_step,
    logp: parseFloat(addNoise(point.logp, 0.006, progress, true, 0.0).toFixed(4)),
  };
});

const TRACE_DATA = [
  {
    id: 1,
    intent: 'track_order',
    input: 'Where is my order?',
    baseline: 'Your order is on the way.',
    trained: 'Thank you for reaching out. You can see your delivery date and detailed order whereabouts in your personal area. May I have your order ID?',
    result: 'improved',
  },
  {
    id: 2,
    intent: 'track_refund',
    input: 'I want to check my refund.',
    baseline: 'Your refund is being processed.',
    trained: 'Thank you for contacting us. To check your refund status, could you please provide your refund case ID? You should have received it via email.',
    result: 'improved',
  },
  {
    id: 3,
    intent: 'cancel_order',
    input: 'Cancel my order please',
    baseline: 'Your order has been cancelled.',
    trained: 'Thank you for reaching out. I can help you cancel your order. May I ask the reason for cancellation? Please note there is a $4.99 fee if delivery is less than 2 days away.',
    result: 'improved',
  },
  {
    id: 4,
    intent: 'change_order',
    input: 'I want to change my order',
    baseline: 'What would you like to change?',
    trained: 'Thank you for contacting us. I can help you change your order to the same brand only. Please note that changes cannot be made if delivery is less than 2 days away. What would you like to change?',
    result: 'improved',
  },
];

export function DashboardPage() {
  const { metrics, navigateTo, trainingConfig, dataset } = useStore();

  const trainedModelLabel = trainingConfig.model ? `${trainingConfig.model} (Trained)` : 'Trained Model';

  // Format training method description
  const getTrainingMethodDescription = () => {
    const strategies = trainingConfig.strategies || ['RL'];
    const strategyMap: { [key: string]: string } = {
      'SFT': 'SFT',
      'RL': 'RLEF + RLAIF',
      'OPD': 'On-Policy Distillation'
    };
    return strategies.map(s => strategyMap[s] || s).join(' + ');
  };

  // Format sample count
  const getSampleCount = () => {
    if (!dataset) return '20k';
    const rows = dataset.rows;
    if (rows >= 1000) {
      return `${(rows / 1000).toFixed(0)}k`;
    }
    return rows.toString();
  };

  const performanceData = [
    { metric: 'Intent', 'GPT-4o': metrics.gpt4o.intent, [trainedModelLabel]: metrics.trained.intent },
  ];

  const latencyData = [
    { metric: 'p50', 'GPT-4o': metrics.gpt4o.p50, [trainedModelLabel]: metrics.trained.p50 },
    { metric: 'p95', 'GPT-4o': metrics.gpt4o.p50 * 1.5, [trainedModelLabel]: metrics.trained.p50 * 1.5 },
  ];

  const handleDownload = (filename: string) => {
    const link = document.createElement('a');
    link.href = `/${filename}`;
    link.download = filename;
    link.click();
  };

  const calculateDelta = (trained: number, baseline: number) => {
    const delta = trained - baseline;
    const percentage = delta.toFixed(1);
    return { delta, percentage, isPositive: delta > 0 };
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900">
      {/* Page Header */}
      <div className="border-b border-zinc-800 p-6 bg-zinc-950">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Model Builder Run – hearty-disco-58</h1>
            <p className="text-zinc-400 mt-1">Post-training results using {getTrainingMethodDescription()} pipelines; synthetic data generation: {getSampleCount()} samples, model: {trainingConfig.model || 'Not specified'}</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => handleDownload('summary.pdf')} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Summary PDF
            </Button>
            <Button onClick={() => handleDownload('metrics.csv')} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Metrics CSV
            </Button>
            <Button onClick={() => handleDownload('evals.json')} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Evals JSON
            </Button>
            <Button onClick={() => navigateTo('data')} variant="outline" className="ml-2">
              <RotateCcw className="w-4 h-4 mr-2" />
              Restart
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Metric Cards */}
          <div className="grid grid-cols-3 gap-6">
            {/* Intent Accuracy */}
            <Card className="p-8 bg-gradient-to-br from-zinc-800 to-zinc-900 border-2 border-zinc-700 hover:border-[#00A99D] transition-all shadow-lg">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Intent Accuracy</p>
                <div className="flex items-baseline gap-3">
                  <p className="text-5xl font-black text-white">{metrics.trained.intent}%</p>
                  {(() => {
                    const { percentage, isPositive } = calculateDelta(
                      metrics.trained.intent,
                      metrics.gpt4o.intent
                    );
                    return (
                      <div className={`flex items-center gap-1 text-lg font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                        {percentage}%
                      </div>
                    );
                  })()}
                </div>
                <div className="pt-2 border-t border-zinc-700">
                  <p className="text-sm font-medium text-zinc-400">
                    vs GPT-4o <span className="text-blue-400 font-bold">(90%)</span>
                  </p>
                </div>
              </div>
            </Card>

            {/* Latency */}
            <Card className="p-8 bg-gradient-to-br from-zinc-800 to-zinc-900 border-2 border-zinc-700 hover:border-[#00A99D] transition-all shadow-lg">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Latency (p50)</p>
                <div className="flex items-baseline gap-3">
                  <p className="text-5xl font-black text-white">{metrics.trained.p50}<span className="text-2xl">ms</span></p>
                  {(() => {
                    const delta = metrics.trained.p50 - metrics.gpt4o.p50;
                    const percentage = ((delta / metrics.gpt4o.p50) * 100).toFixed(1);
                    const isImprovement = delta < 0; // Lower is better
                    return (
                      <div className={`flex items-center gap-1 text-lg font-bold ${isImprovement ? 'text-green-400' : 'text-red-400'}`}>
                        {isImprovement ? <TrendingDown className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
                        {Math.abs(parseFloat(percentage))}%
                      </div>
                    );
                  })()}
                </div>
                <div className="pt-2 border-t border-zinc-700">
                  <p className="text-sm font-medium text-zinc-400">
                    vs GPT-4o <span className="text-blue-400 font-bold">({metrics.gpt4o.p50}ms)</span>
                  </p>
                </div>
              </div>
            </Card>

            {/* Cost */}
            <Card className="p-8 bg-gradient-to-br from-zinc-800 to-zinc-900 border-2 border-zinc-700 hover:border-[#00A99D] transition-all shadow-lg">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Cost / 1k req</p>
                <div className="flex items-baseline gap-3">
                  <p className="text-5xl font-black text-white">${metrics.trained.cost}</p>
                  {(() => {
                    const delta = metrics.trained.cost - metrics.gpt4o.cost;
                    const percentage = ((delta / metrics.gpt4o.cost) * 100).toFixed(1);
                    const isImprovement = delta < 0; // Lower is better
                    return (
                      <div className={`flex items-center gap-1 text-lg font-bold ${isImprovement ? 'text-green-400' : 'text-red-400'}`}>
                        {isImprovement ? <TrendingDown className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
                        {Math.abs(parseFloat(percentage))}%
                      </div>
                    );
                  })()}
                </div>
                <div className="pt-2 border-t border-zinc-700">
                  <p className="text-sm font-medium text-zinc-400">
                    vs GPT-4o <span className="text-blue-400 font-bold">(${metrics.gpt4o.cost})</span>
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Accuracy Over Time - Featured Graph */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Intent Accuracy Training Progress</h2>
            <Card className="p-6 bg-zinc-800 border-zinc-700">
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={TRAINING_CURVES} margin={{ top: 5, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                  <XAxis
                    dataKey="training_step"
                    stroke="#a1a1aa"
                    label={{ value: 'Training Steps', position: 'insideBottom', offset: -10, fill: '#a1a1aa' }}
                  />
                  <YAxis stroke="#a1a1aa" domain={[70, 100]} label={{ value: 'Accuracy (%)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#27272a', border: '1px solid #3f3f46' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Line type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Training Curves Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">RL Training Curves</h2>

            {/* First row: Loss and Reward */}
            <div className="grid grid-cols-2 gap-6">
              {/* Total Loss */}
              <Card className="p-6 bg-zinc-800 border-zinc-700">
                <h3 className="text-lg font-semibold mb-4">Total Loss Over Time</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={TRAINING_CURVES}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                    <XAxis dataKey="training_step" stroke="#a1a1aa" />
                    <YAxis stroke="#a1a1aa" label={{ value: 'Loss', angle: -90, position: 'insideLeft' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#27272a', border: '1px solid #3f3f46' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Line type="monotone" dataKey="loss" stroke="#ef4444" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              {/* Reward */}
              <Card className="p-6 bg-zinc-800 border-zinc-700">
                <h3 className="text-lg font-semibold mb-4">Average Reward Over Time</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={TRAINING_CURVES}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                    <XAxis dataKey="training_step" stroke="#a1a1aa" />
                    <YAxis stroke="#a1a1aa" label={{ value: 'Reward', angle: -90, position: 'insideLeft' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#27272a', border: '1px solid #3f3f46' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Line type="monotone" dataKey="reward" stroke="#10b981" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Third row: KL Divergence and Reward Progression */}
            <div className="grid grid-cols-2 gap-6">
              <Card className="p-6 bg-zinc-800 border-zinc-700">
                <h3 className="text-lg font-semibold mb-4">KL Divergence</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={KL_DIVERGENCE_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                    <XAxis dataKey="training_step" stroke="#a1a1aa" />
                    <YAxis stroke="#a1a1aa" label={{ value: 'KL Divergence', angle: -90, position: 'insideLeft' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#27272a', border: '1px solid #3f3f46' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Line type="monotone" dataKey="kl" stroke="#06b6d4" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              {/* Reward Progression (Intent Match) */}
              <Card className="p-6 bg-zinc-800 border-zinc-700">
                <h3 className="text-lg font-semibold mb-4">Reward Progression (Intent Match)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={REWARD_INTENT_MATCH_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                    <XAxis dataKey="training_step" stroke="#a1a1aa" />
                    <YAxis stroke="#a1a1aa" domain={[0.55, 0.85]} label={{ value: 'Reward', angle: -90, position: 'insideLeft' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#27272a', border: '1px solid #3f3f46' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Line type="monotone" dataKey="reward" stroke="#22c55e" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Fourth row: Sampling Log Prob Difference */}
            <div className="grid grid-cols-2 gap-6">
              <Card className="p-6 bg-zinc-800 border-zinc-700">
                <h3 className="text-lg font-semibold mb-4">Sampling Log Prob Diff (Mean)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={SAMPLING_LOGP_DIFF_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                    <XAxis dataKey="training_step" stroke="#a1a1aa" />
                    <YAxis stroke="#a1a1aa" domain={[0, 0.045]} label={{ value: 'Log Prob Diff', angle: -90, position: 'insideLeft' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#27272a', border: '1px solid #3f3f46' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Line type="monotone" dataKey="logp" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              {/* Empty placeholder for symmetry */}
              <div />
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-2 gap-6">
            {/* Performance Bar Chart */}
            <Card className="p-6 bg-zinc-800 border-zinc-700">
              <h3 className="text-lg font-semibold mb-4">Accuracy Metrics</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                  <XAxis dataKey="metric" stroke="#a1a1aa" />
                  <YAxis stroke="#a1a1aa" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#27272a', border: '1px solid #3f3f46' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    wrapperStyle={{ paddingBottom: '10px' }}
                  />
                  <Bar dataKey="GPT-4o" fill="#3b82f6" />
                  <Bar dataKey={trainedModelLabel} fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Latency Line Chart */}
            <Card className="p-6 bg-zinc-800 border-zinc-700">
              <h3 className="text-lg font-semibold mb-4">Latency Comparison</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={latencyData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                  <XAxis dataKey="metric" stroke="#a1a1aa" />
                  <YAxis stroke="#a1a1aa" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#27272a', border: '1px solid #3f3f46' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    wrapperStyle={{ paddingBottom: '10px' }}
                  />
                  <Line type="monotone" dataKey="GPT-4o" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey={trainedModelLabel} stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Evaluation Traces */}
          <Card className="p-6 bg-zinc-800 border-zinc-700">
            <h3 className="text-lg font-semibold mb-4">Sample Evaluation Traces</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Intent</TableHead>
                  <TableHead className="w-48">User Input</TableHead>
                  <TableHead>GPT-4o Response</TableHead>
                  <TableHead>{trainedModelLabel} Response</TableHead>
                  <TableHead className="w-24">Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {TRACE_DATA.map((trace) => (
                  <TableRow key={trace.id}>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {trace.intent}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{trace.input}</TableCell>
                    <TableCell className="text-sm text-zinc-400">{trace.baseline}</TableCell>
                    <TableCell className="text-sm text-green-400">{trace.trained}</TableCell>
                    <TableCell>
                      <Badge className="bg-green-600">
                        {trace.result}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Model Comparison Table */}
          <Card className="p-6 bg-zinc-800 border-zinc-700">
            <h3 className="text-lg font-semibold mb-4">Model Comparison Summary</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Model</TableHead>
                  <TableHead>Intent</TableHead>
                  <TableHead>p50 (ms)</TableHead>
                  <TableHead>Cost / 1k</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">GPT-4o</TableCell>
                  <TableCell>{metrics.gpt4o.intent}%</TableCell>
                  <TableCell>{metrics.gpt4o.p50}ms</TableCell>
                  <TableCell>${metrics.gpt4o.cost}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">{trainingConfig.model || 'Trained Model'} (GRPO RLEF RLAIF)</TableCell>
                  <TableCell className="text-green-400">{metrics.trained.intent}%</TableCell>
                  <TableCell className="text-green-400">{metrics.trained.p50}ms</TableCell>
                  <TableCell className="text-green-400">${metrics.trained.cost}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>
    </div>
  );
}
