'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';

export function ProjectEnvironmentPage() {
  const { environmentConfig, setEnvironmentConfig, navigateTo, trainingConfig, setTrainingConfig } = useStore();
  const [envConnecting, setEnvConnecting] = useState(false);
  const [visibleLogs, setVisibleLogs] = useState<number>(0);
  const [instanceId, setInstanceId] = useState('i-' + Math.random().toString(36).substr(2, 9));
  const [publicIp, setPublicIp] = useState(`54.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`);
  const [vpcId, setVpcId] = useState('vpc-' + Math.random().toString(36).substr(2, 7));
  const [volumeId, setVolumeId] = useState('vol-' + Math.random().toString(36).substr(2, 8));
  const [uptime, setUptime] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [defaultModel, setDefaultModel] = useState(trainingConfig.defaultModel);
  const [judgeModel, setJudgeModel] = useState(trainingConfig.aiJudge);
  const [isMounted, setIsMounted] = useState(false);

  // Prevent hydration mismatch by only rendering Select components on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // On mount, if already connected (returning to page), show all logs immediately
  useEffect(() => {
    if (environmentConfig.isConnected && !isConnecting) {
      setVisibleLogs(20);
    }
  }, []);

  // When actively connecting, stream logs with animation
  useEffect(() => {
    if (isConnecting && environmentConfig.isConnected) {
      const logTimings = [
        0, 800, 1400, 2200, 3800, 4500, 5200, 6800, 8200, 9500,
        11000, 12800, 14500, 16200, 18000, 19500, 21000, 22800, 24500, 26000
      ];

      logTimings.forEach((delay, index) => {
        setTimeout(() => {
          setVisibleLogs(index + 1);
        }, delay);
      });

      // Reset isConnecting flag after streaming completes
      setTimeout(() => {
        setIsConnecting(false);
      }, 26100);
    }
  }, [isConnecting, environmentConfig.isConnected]);

  // Separate useEffect for uptime counter - only start after logs are done
  useEffect(() => {
    if (environmentConfig.isConnected && visibleLogs >= 20) {
      const uptimeInterval = setInterval(() => {
        setUptime(prev => prev + 1);
      }, 1000);

      return () => clearInterval(uptimeInterval);
    }
  }, [environmentConfig.isConnected, visibleLogs]);

  const connectEnvironment = () => {
    setEnvConnecting(true);
    setVisibleLogs(0);
    setIsConnecting(true);

    // Generate random instance ID and IP
    const generatedInstanceId = 'i-' + Math.random().toString(36).substr(2, 9);
    const generatedIp = `54.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;

    setInstanceId(generatedInstanceId);
    setPublicIp(generatedIp);

    // Complete connection quickly (after 4 seconds)
    setTimeout(() => {
      setEnvConnecting(false);
      setEnvironmentConfig({ isConnected: true });
      toast.success('Training environment connected successfully');
    }, 4000);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900">
      {/* Page Header */}
      <div className="border-b border-zinc-800 p-6 bg-zinc-950">
        <h1 className="text-2xl font-semibold">Environment Setup</h1>
        <p className="text-zinc-400 mt-1">Select your cloud infrastructure and compute resources for model training</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {!environmentConfig.isConnected ? (
            <>
              {/* Cloud Provider Selection */}
              <Card className="p-6 bg-zinc-800 border-zinc-700 space-y-4">
                <label className="text-sm font-medium block">Training Infrastructure</label>
                <div className="p-6 bg-zinc-900 rounded-lg border-2 border-[#FF9900] shadow-lg shadow-[#FF9900]/20">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Image
                        src="/aws-color.png"
                        alt="AWS"
                        width={60}
                        height={40}
                        className="h-10 w-auto object-contain"
                      />
                      <Badge variant="outline" className="text-xs border-[#FF9900] text-[#FF9900]">
                        Active
                      </Badge>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Amazon Web Services</h3>
                      <p className="text-xs text-zinc-400 mt-1">EC2 GPU instances for distributed training</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* AWS Account Details */}
              <Card className="p-6 bg-zinc-800 border-zinc-700 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="w-4 h-4 text-[#00A99D]" />
                  <h3 className="text-sm font-semibold text-white">Connected AWS Account</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3 bg-zinc-900/50 p-4 rounded-lg">
                    <div>
                      <span className="text-xs text-zinc-500 block mb-1">Account Name</span>
                      <span className="text-sm text-white font-medium">Workato ML Training</span>
                    </div>
                    <div>
                      <span className="text-xs text-zinc-500 block mb-1">Account ID</span>
                      <span className="text-sm text-white font-mono">428571693842</span>
                    </div>
                    <div>
                      <span className="text-xs text-zinc-500 block mb-1">Account Alias</span>
                      <span className="text-sm text-white font-mono">workato-ml-prod</span>
                    </div>
                  </div>

                  <div className="space-y-3 bg-zinc-900/50 p-4 rounded-lg">
                    <div>
                      <span className="text-xs text-zinc-500 block mb-1">IAM Role</span>
                      <span className="text-sm text-white font-mono">WorkatoMLTrainingRole</span>
                    </div>
                    <div>
                      <span className="text-xs text-zinc-500 block mb-1">Access Key ID</span>
                      <span className="text-sm text-white font-mono">AKIA3T7F••••••••JKPQ</span>
                    </div>
                    <div>
                      <span className="text-xs text-zinc-500 block mb-1">Permissions</span>
                      <span className="text-xs text-[#00A99D]">EC2, S3, CloudWatch, IAM (limited)</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Model Configuration */}
              <Card className="p-6 bg-zinc-800 border-zinc-700">
                <h3 className="text-lg font-semibold mb-2 text-white">Model Configuration</h3>
                <p className="text-sm text-zinc-400 mb-6">
                  Select the default model and AI judge model for your training pipeline
                </p>

                {isMounted ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium block mb-2 text-zinc-300">Default Model</label>
                      <Select value={defaultModel} onValueChange={setDefaultModel}>
                        <SelectTrigger className="bg-zinc-900 border-zinc-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="OpenAI gpt-oss-20b">OpenAI gpt-oss-20b</SelectItem>
                          <SelectItem value="OpenAI gpt-oss-120b">OpenAI gpt-oss-120b</SelectItem>
                          <SelectItem value="Qwen3-14B">Qwen3-14B</SelectItem>
                          <SelectItem value="Qwen3 235B A22B Instruct">Qwen3 235B A22B Instruct</SelectItem>
                          <SelectItem value="Llama 3.1 8B Instruct">Llama 3.1 8B Instruct</SelectItem>
                          <SelectItem value="DeepSeek R1 0528">DeepSeek R1 0528</SelectItem>
                          <SelectItem value="DeepSeek V3.1 Terminus">DeepSeek V3.1 Terminus</SelectItem>
                          <SelectItem value="Kimi K2 Thinking">Kimi K2 Thinking</SelectItem>
                          <SelectItem value="Kimi K2 Instruct 0905">Kimi K2 Instruct 0905</SelectItem>
                          <SelectItem value="MiniMax M2">MiniMax M2</SelectItem>
                          <SelectItem value="GLM-4.6">GLM-4.6</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-zinc-500 mt-2">Model for project knowledge</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium block mb-2 text-zinc-300">AI Judge Model</label>
                      <Select value={judgeModel} onValueChange={setJudgeModel}>
                        <SelectTrigger className="bg-zinc-900 border-zinc-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Qwen3 235B A22B Instruct">Qwen3 235B A22B Instruct</SelectItem>
                          <SelectItem value="DeepSeek R1 0528">DeepSeek R1 0528</SelectItem>
                          <SelectItem value="Kimi K2 Thinking">Kimi K2 Thinking</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-zinc-500 mt-2">Model for reward feedback and evaluation</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium block mb-2 text-zinc-300">Default Model</label>
                      <div className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm">
                        {defaultModel}
                      </div>
                      <p className="text-xs text-zinc-500 mt-2">Model for project knowledge</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-2 text-zinc-300">AI Judge Model</label>
                      <div className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm">
                        {judgeModel}
                      </div>
                      <p className="text-xs text-zinc-500 mt-2">Model for reward feedback and evaluation</p>
                    </div>
                  </div>
                )}
              </Card>

              {/* AWS Configuration */}
              <div className="space-y-6">

                  {/* Region & Instance Configuration */}
                  <Card className="p-6 bg-zinc-800 border-zinc-700 space-y-4">
                    {isMounted ? (
                      <>
                        <div>
                          <label className="text-sm font-medium block mb-3">AWS Region</label>
                          <Select value={environmentConfig.region} onValueChange={(v) => setEnvironmentConfig({ region: v })}>
                            <SelectTrigger className="bg-zinc-900 border-zinc-700">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="us-west-2">US West (Oregon) - us-west-2</SelectItem>
                              <SelectItem value="us-east-1">US East (Virginia) - us-east-1</SelectItem>
                              <SelectItem value="eu-west-1">EU West (Ireland) - eu-west-1</SelectItem>
                              <SelectItem value="ap-northeast-1">Asia Pacific (Tokyo) - ap-northeast-1</SelectItem>
                              <SelectItem value="ap-southeast-1">Asia Pacific (Singapore) - ap-southeast-1</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-sm font-medium block mb-3">EC2 Instance Type</label>
                          <Select value={environmentConfig.instanceType} onValueChange={(v) => setEnvironmentConfig({ instanceType: v })}>
                            <SelectTrigger className="bg-zinc-900 border-zinc-700">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="p4d.24xlarge">
                                <div className="font-mono text-sm">p4d.24xlarge</div>
                                <div className="text-xs text-zinc-400">8× A100 (320GB) • 96 vCPU • 1152 GB RAM • 400 Gbps network</div>
                              </SelectItem>
                              <SelectItem value="p3.8xlarge">
                                <div className="font-mono text-sm">p3.8xlarge</div>
                                <div className="text-xs text-zinc-400">4× V100 (64GB) • 32 vCPU • 244 GB RAM • 10 Gbps network</div>
                              </SelectItem>
                              <SelectItem value="g5.12xlarge">
                                <div className="font-mono text-sm">g5.12xlarge</div>
                                <div className="text-xs text-zinc-400">4× A10G (96GB) • 48 vCPU • 192 GB RAM • 50 Gbps network</div>
                              </SelectItem>
                              <SelectItem value="g5.48xlarge">
                                <div className="font-mono text-sm">g5.48xlarge</div>
                                <div className="text-xs text-zinc-400">8× A10G (192GB) • 192 vCPU • 768 GB RAM • 100 Gbps network</div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="text-sm font-medium block mb-3">AWS Region</label>
                          <div className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm">
                            {environmentConfig.region}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium block mb-3">EC2 Instance Type</label>
                          <div className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm font-mono">
                            {environmentConfig.instanceType}
                          </div>
                        </div>
                      </>
                    )}
                  </Card>

                  {/* VPC & Storage Configuration */}
                  <Card className="p-6 bg-zinc-800 border-zinc-700 space-y-4">
                    <div>
                      <label className="text-sm font-medium block mb-3">VPC Configuration</label>
                      <RadioGroup value={environmentConfig.vpcOption} onValueChange={(v) => setEnvironmentConfig({ vpcOption: v as 'new' | 'existing' })}>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3 p-3 bg-zinc-900 rounded-lg">
                            <RadioGroupItem value="new" id="new-vpc" />
                            <label htmlFor="new-vpc" className="flex-1 cursor-pointer">
                              <p className="font-medium">Create new VPC</p>
                              <p className="text-xs text-zinc-400">10.0.0.0/16 CIDR, 3 subnets across AZs</p>
                            </label>
                          </div>
                          <div className="flex items-center space-x-3 p-3 bg-zinc-900 rounded-lg">
                            <RadioGroupItem value="existing" id="existing-vpc" />
                            <label htmlFor="existing-vpc" className="flex-1 cursor-pointer">
                              <p className="font-medium">Use existing VPC</p>
                              <p className="text-xs text-zinc-400">Connect to your infrastructure</p>
                            </label>
                          </div>
                        </div>
                      </RadioGroup>

                      {environmentConfig.vpcOption === 'existing' && (
                        <Input
                          value={environmentConfig.existingVpcId}
                          onChange={(e) => setEnvironmentConfig({ existingVpcId: e.target.value })}
                          placeholder="vpc-xxxxx"
                          className="bg-zinc-900 border-zinc-700 font-mono text-sm mt-3"
                        />
                      )}
                    </div>

                    {isMounted ? (
                      <div>
                        <label className="text-sm font-medium block mb-3">EBS Volume</label>
                        <Select value={environmentConfig.storageSize} onValueChange={(v) => setEnvironmentConfig({ storageSize: v })}>
                          <SelectTrigger className="bg-zinc-900 border-zinc-700">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="500">
                              <div>500 GB</div>
                              <div className="text-xs text-zinc-400">gp3 • 16000 IOPS • 1000 MB/s</div>
                            </SelectItem>
                            <SelectItem value="1000">
                              <div>1 TB</div>
                              <div className="text-xs text-zinc-400">gp3 • 16000 IOPS • 1000 MB/s</div>
                            </SelectItem>
                            <SelectItem value="2000">
                              <div>2 TB</div>
                              <div className="text-xs text-zinc-400">io2 • 32000 IOPS • 4000 MB/s</div>
                            </SelectItem>
                            <SelectItem value="5000">
                              <div>5 TB</div>
                              <div className="text-xs text-zinc-400">io2 • 64000 IOPS • 4000 MB/s</div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <div>
                        <label className="text-sm font-medium block mb-3">EBS Volume</label>
                        <div className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm">
                          {environmentConfig.storageSize} GB
                        </div>
                      </div>
                    )}
                  </Card>

                  {/* Advanced Configuration */}
                  <Card className="p-6 bg-zinc-800 border-zinc-700 space-y-4">
                    <h3 className="text-sm font-semibold">Advanced Configuration</h3>

                    {isMounted ? (
                      <>
                        <div>
                          <label className="text-sm font-medium block mb-2">Placement Strategy</label>
                          <Select defaultValue="cluster">
                            <SelectTrigger className="bg-zinc-900 border-zinc-700 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cluster">Cluster - Low latency (recommended for training)</SelectItem>
                              <SelectItem value="spread">Spread - High availability</SelectItem>
                              <SelectItem value="partition">Partition - Large distributed workloads</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-sm font-medium block mb-2">Instance Tenancy</label>
                          <Select defaultValue="default">
                            <SelectTrigger className="bg-zinc-900 border-zinc-700 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="default">Shared - Standard EC2</SelectItem>
                              <SelectItem value="dedicated">Dedicated - Isolated hardware</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-sm font-medium block mb-2">EFA (Elastic Fabric Adapter)</label>
                          <Select defaultValue="enabled">
                            <SelectTrigger className="bg-zinc-900 border-zinc-700 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="enabled">Enabled - Ultra-low latency networking</SelectItem>
                              <SelectItem value="disabled">Disabled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="text-sm font-medium block mb-2">Placement Strategy</label>
                          <div className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-xs">
                            Cluster - Low latency (recommended for training)
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium block mb-2">Instance Tenancy</label>
                          <div className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-xs">
                            Shared - Standard EC2
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium block mb-2">EFA (Elastic Fabric Adapter)</label>
                          <div className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-xs">
                            Enabled - Ultra-low latency networking
                          </div>
                        </div>
                      </>
                    )}
                  </Card>

                  {/* Connect Button */}
                  <div className="flex justify-end pt-4">
                    <Button
                      onClick={connectEnvironment}
                      disabled={envConnecting || (environmentConfig.vpcOption === 'existing' && !environmentConfig.existingVpcId)}
                      size="lg"
                      className="bg-[#00A99D] hover:bg-[#008c82]"
                    >
                      {envConnecting ? 'Connecting...' : 'Connect Environment'}
                    </Button>
                  </div>
                </div>
            </>
          ) : (
            <>
              {/* Connected State */}
              <Card className="p-6 bg-[#00A99D]/10 border-[#00A99D]/30">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#00A99D]/20 flex items-center justify-center">
                    <Check className="w-6 h-6 text-[#00A99D]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#00A99D]">Environment Connected</h3>
                    <p className="text-sm text-zinc-300">AWS EC2 instance provisioned and ready for training</p>
                  </div>
                </div>
              </Card>

              {/* Environment Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4 bg-zinc-800 border-zinc-700">
                  <h3 className="text-xs font-semibold text-zinc-400 mb-3 uppercase tracking-wide">Infrastructure</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400 text-xs">Provider</span>
                      <span className="text-white font-medium text-xs">AWS</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400 text-xs">Region</span>
                      <span className="text-white font-mono text-xs">{environmentConfig.region}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400 text-xs">AZ</span>
                      <span className="text-white font-mono text-xs">{environmentConfig.region}a</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400 text-xs">VPC</span>
                      <span className="text-white font-mono text-xs">
                        {environmentConfig.vpcOption === 'new' ? vpcId : environmentConfig.existingVpcId}
                      </span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-zinc-800 border-zinc-700">
                  <h3 className="text-xs font-semibold text-zinc-400 mb-3 uppercase tracking-wide">Compute</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400 text-xs">Instance</span>
                      <span className="text-white font-mono text-xs">{environmentConfig.instanceType}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400 text-xs">GPUs</span>
                      <span className="text-white font-medium text-xs">8× A100 (320GB)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400 text-xs">vCPU</span>
                      <span className="text-white font-medium text-xs">96 cores</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400 text-xs">Memory</span>
                      <span className="text-white font-medium text-xs">1152 GB</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-zinc-800 border-zinc-700">
                  <h3 className="text-xs font-semibold text-zinc-400 mb-3 uppercase tracking-wide">Storage & Network</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400 text-xs">Volume</span>
                      <span className="text-white font-medium text-xs">{environmentConfig.storageSize} GB</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400 text-xs">Type</span>
                      <span className="text-white font-mono text-xs">
                        {Number(environmentConfig.storageSize) >= 2000 ? 'io2' : 'gp3'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400 text-xs">IOPS</span>
                      <span className="text-white font-medium text-xs">
                        {Number(environmentConfig.storageSize) >= 2000 ? '32000' : '16000'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400 text-xs">Network</span>
                      <span className="text-white font-medium text-xs">400 Gbps</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-zinc-800 border-zinc-700">
                  <h3 className="text-xs font-semibold text-zinc-400 mb-3 uppercase tracking-wide">Status</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400 text-xs">State</span>
                      {visibleLogs >= 20 ? (
                        <Badge className="bg-[#00A99D] text-white text-xs px-2 py-0.5">Running</Badge>
                      ) : (
                        <Badge className="bg-yellow-600 text-white text-xs px-2 py-0.5">Initializing</Badge>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400 text-xs">Uptime</span>
                      <span className="text-white font-mono text-xs">
                        {visibleLogs >= 20 ? (
                          <>
                            {String(Math.floor(uptime / 3600)).padStart(2, '0')}:
                            {String(Math.floor((uptime % 3600) / 60)).padStart(2, '0')}:
                            {String(uptime % 60).padStart(2, '0')}
                          </>
                        ) : (
                          '--:--:--'
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400 text-xs">GPU Util</span>
                      <span className="text-[#00A99D] font-medium text-xs">
                        {visibleLogs >= 20 ? '0%' : '--'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400 text-xs">Health</span>
                      <span className={`font-medium text-xs ${visibleLogs >= 20 ? 'text-[#00A99D]' : 'text-yellow-500'}`}>
                        {visibleLogs >= 20 ? '✓ OK' : '⟳ Checking'}
                      </span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Console Logs */}
              <Card className="p-4 bg-black border-zinc-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-zinc-500">~/workato/ml-training</span>
                  <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-500">Streaming</Badge>
                </div>
                <pre className="text-xs font-mono text-zinc-400 leading-relaxed min-h-[240px] max-h-[400px] overflow-y-auto">
                  {visibleLogs >= 1 && <div>2025-01-14 12:34:18 [workato-cli] Starting environment provisioning...</div>}
                  {visibleLogs >= 2 && <div>2025-01-14 12:34:19 [workato-cli] Authenticating with AWS...</div>}
                  {visibleLogs >= 3 && <div>2025-01-14 12:34:19 [workato-cli] ✓ Authenticated as arn:aws:iam::428571693842:role/WorkatoMLTrainingRole</div>}
                  {visibleLogs >= 4 && <div>2025-01-14 12:34:22 [aws-provisioner] Validating resource quotas and availability...</div>}
                  {visibleLogs >= 5 && <div>2025-01-14 12:34:26 [aws-provisioner] ✓ Quota check passed for {environmentConfig.instanceType}</div>}
                  {visibleLogs >= 6 && <div>2025-01-14 12:34:27 [aws-provisioner] Requesting EC2 instance {environmentConfig.instanceType} in {environmentConfig.region}</div>}
                  {visibleLogs >= 7 && <div>2025-01-14 12:34:27 [aws-provisioner] {environmentConfig.vpcOption === 'new' ? 'Creating VPC (10.0.0.0/16) with 3 subnets across availability zones' : `Using existing VPC ${environmentConfig.existingVpcId}`}</div>}
                  {visibleLogs >= 8 && <div>2025-01-14 12:34:32 [aws-provisioner] ✓ VPC created: {vpcId} (10.0.0.0/16)</div>}
                  {visibleLogs >= 9 && <div>2025-01-14 12:34:36 [aws-provisioner] Creating subnets: us-west-2a (10.0.1.0/24), us-west-2b (10.0.2.0/24), us-west-2c (10.0.3.0/24)</div>}
                  {visibleLogs >= 10 && <div>2025-01-14 12:34:39 [aws-provisioner] Configuring internet gateway and route tables...</div>}
                  {visibleLogs >= 11 && <div>2025-01-14 12:34:43 [aws-provisioner] Creating security group: workato-ml-training-sg</div>}
                  {visibleLogs >= 12 && <div>2025-01-14 12:34:46 [aws-provisioner] Allowing inbound: SSH (22), HTTPS (443), Jupyter (8888)</div>}
                  {visibleLogs >= 13 && <div>2025-01-14 12:34:50 [aws-provisioner] Provisioning EBS volume: {environmentConfig.storageSize}GB {Number(environmentConfig.storageSize) >= 2000 ? 'io2' : 'gp3'} @ {Number(environmentConfig.storageSize) >= 2000 ? '32000' : '16000'} IOPS</div>}
                  {visibleLogs >= 14 && <div>2025-01-14 12:34:54 [aws-provisioner] ✓ Volume created: {volumeId}</div>}
                  {visibleLogs >= 15 && <div>2025-01-14 12:34:58 [aws-provisioner] Launching EC2 instance...</div>}
                  {visibleLogs >= 16 && <div>2025-01-14 12:35:01 [aws-provisioner] ✓ Instance {instanceId} in pending state</div>}
                  {visibleLogs >= 17 && <div>2025-01-14 12:35:05 [aws-provisioner] Waiting for instance to reach running state...</div>}
                  {visibleLogs >= 18 && <div>2025-01-14 12:35:10 [aws-provisioner] ✓ Instance running. Public IP: {publicIp}</div>}
                  {visibleLogs >= 19 && <div>2025-01-14 12:35:12 [aws-provisioner] Running bootstrap script (CUDA, PyTorch, dependencies)...</div>}
                  {visibleLogs >= 20 && <div>2025-01-14 12:35:14 [workato-cli] ✓ Environment provisioned successfully. Ready for training.</div>}
                  {visibleLogs > 0 && visibleLogs < 20 && (
                    <div className="mt-1">
                      <span className="animate-pulse">▋</span>
                    </div>
                  )}
                </pre>
              </Card>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={() => {
                    setTrainingConfig({
                      defaultModel: defaultModel,
                      aiJudge: judgeModel,
                    });
                    navigateTo('setup');
                  }}
                  size="lg"
                  className={`bg-[#00A99D] hover:bg-[#008c82] relative overflow-hidden group transition-all duration-300 ${
                    visibleLogs >= 20
                      ? 'shadow-lg shadow-[#00A99D]/50 animate-pulse'
                      : ''
                  }`}
                >
                  {/* Shine effect */}
                  {visibleLogs >= 20 && (
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine"></span>
                  )}
                  <span className="relative z-10">Continue to Project Setup →</span>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
