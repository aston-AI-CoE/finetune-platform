'use client';

import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Upload, Send, ArrowRight, CheckCircle2, Sparkles, FileText, X, Paperclip, User, Bot } from 'lucide-react';
import { useStore } from '@/store/useStore';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  files?: { name: string; size: number }[];
  isTyping?: boolean;
}

const SIMPLE_PROMPT = `I would like to create a intent classification model for e-commerce customer support, I have uploaded the guidelines and intent list below`;

const DETAILED_PROMPT = `I would like to create a intent classification model for e-commerce customer support.

The model should be able to:
- Classify customer support inquiries into 356 different intent categories
- Follow Coupang's AI accuracy performance standards (95% SLA for intent classification)
- Handle complex utterances with multiple intents and prioritize correctly
- Filter out irrelevant utterances (simple requests, feedback, reactions)

I have prepared:
- Guidelines_and_SLAs.txt: Contains the performance standards and classification guidelines
- intent_list.json: Complete list of all 356 intent categories with descriptions

Please process these files and help me set up the training pipeline.`;

const JOB_DESCRIPTION = `You are an Intent Classification Model for E-commerce Customer Support

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

What's my job?

Your primary responsibility is to analyze customer utterances in e-commerce support conversations and accurately classify their intents according to a comprehensive taxonomy of 356 predefined intent categories. You extract the root cause of customer inquiries, distinguish between intents and requests, prioritize multiple intents when present, and filter out irrelevant utterances to ensure appropriate response routing and service quality optimization.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Who will need my help?

  • Customer service agents handling e-commerce support inquiries
  • AI-powered chatbot systems requiring accurate intent routing
  • Quality assurance teams monitoring customer support performance
  • Business intelligence teams analyzing customer behavior patterns
  • Service optimization teams improving response workflows

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

How do I get things done?

  • Analyze complete customer utterances considering full conversational context
  • Apply hierarchical intent structure (depth1~4) to classify intents
  • Distinguish between customer intents (root causes) and requests (desired actions)
  • When multiple intents are detected, prioritize based on P1 > P2 priority levels
  • Detect and extract critical keywords including Intent_tags
  • Filter irrelevant utterances (acknowledgments, feedback, reactions)
  • Cross-reference against 356-intent classification table
  • Maintain 95%+ accuracy for intent detection, 90%+ for request classification
  • Handle complex utterances with multiple intents
  • Provide classification confidence scores and flag ambiguous cases

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

What should I avoid?

  • Do not rely solely on keyword matching without context
  • Avoid conflating customer intents with requested actions
  • Do not prioritize secondary topics over root causes
  • Never overlook hierarchical intent structure
  • Avoid misclassifying vendor-responsible vs customer-responsible issues
  • Do not classify acknowledgments/reactions as having intent
  • Never assign multiple intents with equal priority incorrectly
  • Avoid processing customer/product info as actionable intents

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Key Performance Metrics:

  • Intent classification accuracy: 95%+ target
  • Request classification accuracy: 90%+ target
  • Keyword detection accuracy: 95%+ target
  • Irrelevant utterance filtering: 90%+ target
  • Multi-intent handling success rate
  • Monthly evaluation: minimum 500 cases

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Additional Guidelines:

  • Always consider complete utterance context
  • Prioritize vendor-responsibility for physical defects/damage
  • Focus on root cause intent over solution requests
  • Pay attention to temporal context and utterance sequencing
  • Maintain awareness of domain-specific terminology:
    - Coupang Eats, Coupang Play, WOW Membership, Rocket Mobile
  • Apply priority hierarchy consistently
  • Calibrate classification thresholds continuously
  • Reference comprehensive intent classification table for edge cases`;

export function SetupPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: number }[]>([]);
  const [showFullPrompt, setShowFullPrompt] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { navigateTo, project, updateProjectName } = useStore();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const fileData = files.map(file => ({
      name: file.name,
      size: file.size
    }));
    setUploadedFiles(prev => [...prev, ...fileData]);
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUseSimplePrompt = () => {
    setInput(SIMPLE_PROMPT);
  };

  const handleUseDetailedPrompt = () => {
    setInput(DETAILED_PROMPT);
    setShowFullPrompt(false);
  };

  const handleSend = () => {
    if (!input.trim() && uploadedFiles.length === 0) return;

    const newMessage: Message = {
      role: 'user',
      content: input,
      files: uploadedFiles.length > 0 ? [...uploadedFiles] : undefined
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setUploadedFiles([]);

    // Auto-respond with thinking state and typewriter effect
    setTimeout(async () => {
      if (newMessage.files && newMessage.files.length > 0) {
        // First show acknowledgment
        let acknowledgment = `Perfect! I've received your files:\n\n`;
        newMessage.files.forEach(file => {
          acknowledgment += `✓ ${file.name}\n`;
        });

        // Add acknowledgment with typewriter
        await addTypingMessageAsync(acknowledgment, 0);

        // Then show thinking state
        await addTypingMessageAsync('Processing guidelines and analyzing intent classification requirements...', 500);

        // Finally show the job description
        await addTypingMessageAsync(
          `${JOB_DESCRIPTION}\n\n---\n\nYour intent classification model has been configured with these guidelines. You can now proceed to the next step to set up your training data.`,
          800
        );

        // Update project name
        setTimeout(() => {
          typewriterRename('Intent Classification Model');
        }, 500);
      } else {
        await addTypingMessageAsync('Thank you for the information. Please upload your guidelines and intent list files to continue.', 0);
      }
    }, 600);
  };

  const typewriterRename = (targetName: string) => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= targetName.length) {
        updateProjectName(project.id, targetName.substring(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 50);
  };

  const addTypingMessageAsync = (content: string, delay: number = 0): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        setMessages(prev => {
          const newMessages = [...prev, {
            role: 'assistant' as const,
            content: '',
            isTyping: true
          }];

          // Start typewriter effect
          const messageIndex = newMessages.length - 1;
          let currentIndex = 0;
          const typingSpeed = content.length > 500 ? 3 : 15; // Faster for long content

          const interval = setInterval(() => {
            if (currentIndex <= content.length) {
              setMessages(current => {
                const updated = [...current];
                if (updated[messageIndex]) {
                  updated[messageIndex] = {
                    ...updated[messageIndex],
                    content: content.substring(0, currentIndex)
                  };
                }
                return updated;
              });
              currentIndex++;
            } else {
              clearInterval(interval);
              setMessages(current => {
                const updated = [...current];
                if (updated[messageIndex]) {
                  updated[messageIndex] = {
                    ...updated[messageIndex],
                    isTyping: false
                  };
                }
                return updated;
              });
              resolve();
            }
          }, typingSpeed);

          return newMessages;
        });
      }, delay);
    });
  };

  const hasAssistantResponse = messages.some(m => m.role === 'assistant');

  return (
    <div className="flex flex-col h-full bg-zinc-900">
      {/* Page Header */}
      <div className="border-b border-zinc-800 p-6 bg-zinc-950">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Project Setup</h1>
            <p className="text-zinc-400 mt-1">Define your guidelines and upload configuration files</p>
          </div>
          {hasAssistantResponse && (
            <Button
              onClick={() => navigateTo('data')}
              size="lg"
              className="bg-[#00A99D] hover:bg-[#008c82] shadow-lg shadow-[#00A99D]/30 hover:shadow-xl hover:shadow-[#00A99D]/40 transition-all duration-200 group px-6 py-5"
            >
              <CheckCircle2 className="w-5 h-5 mr-2" />
              <span className="font-semibold">Continue to Data Setup</span>
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          )}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-8 space-y-1">
        {/* Empty state with sample prompts */}
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="max-w-3xl w-full space-y-6">
              {/* Header */}
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold text-white">Define Your Training Guidelines</h2>
                <p className="text-zinc-400">
                  Describe your AI agent's objectives and upload your configuration files
                </p>
              </div>

              {/* Example Prompts */}
              <div className="grid grid-cols-1 gap-3">
                {/* Simple Prompt */}
                <Card
                  className="p-4 bg-zinc-800 border-zinc-700 hover:border-[#00A99D] hover:bg-zinc-800/80 transition-all cursor-pointer group"
                  onClick={handleUseSimplePrompt}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-[#00A99D]/10 rounded-lg flex-shrink-0 group-hover:bg-[#00A99D]/20 transition-colors">
                      <Sparkles className="w-5 h-5 text-[#00A99D]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-white mb-1">Quick Start - Intent Classification</h3>
                      <p className="text-xs text-zinc-400 line-clamp-2">
                        Simple prompt for intent classification model with file uploads
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-[#00A99D] transition-colors flex-shrink-0 mt-1" />
                  </div>
                </Card>

                {/* Detailed Prompt */}
                <Card
                  className="p-4 bg-zinc-800 border-zinc-700 hover:border-[#00A99D] hover:bg-zinc-800/80 transition-all cursor-pointer group"
                  onClick={() => setShowFullPrompt(true)}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg flex-shrink-0 group-hover:bg-blue-500/20 transition-colors">
                      <FileText className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-white mb-1">Detailed - Intent Classification</h3>
                      <p className="text-xs text-zinc-400 line-clamp-2">
                        Comprehensive prompt with requirements and specifications (356 categories, 95% SLA)
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-[#00A99D] transition-colors flex-shrink-0 mt-1" />
                  </div>
                </Card>

                {/* Custom Prompt CTA */}
                <Card className="p-4 bg-zinc-800/50 border-zinc-700 border-dashed hover:border-zinc-600 transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-zinc-700/50 rounded-lg flex-shrink-0">
                      <FileText className="w-5 h-5 text-zinc-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-zinc-300">Or write your own custom prompt</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Full Prompt Dialog */}
        <Dialog open={showFullPrompt} onOpenChange={setShowFullPrompt}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-zinc-900 border-zinc-700">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Intent Classification Model</DialogTitle>
              <DialogDescription className="text-zinc-400">
                Example prompt for creating an intent classification model for e-commerce customer support
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-zinc-950 rounded-lg p-4 text-sm text-zinc-300 whitespace-pre-wrap border border-zinc-800 max-h-[50vh] overflow-y-auto font-mono">
                {DETAILED_PROMPT}
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleUseDetailedPrompt}
                  className="flex-1 bg-[#00A99D] hover:bg-[#008c82]"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Use This Prompt
                </Button>
                <Button
                  onClick={() => setShowFullPrompt(false)}
                  variant="outline"
                  className="border-zinc-700"
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Messages */}
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'} group mb-6`}
          >
            {message.role === 'assistant' && (
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#00A99D] via-[#00A99D] to-[#008c82] flex items-center justify-center shadow-lg ring-2 ring-zinc-800/50 ring-offset-2 ring-offset-zinc-900">
                <Bot className="w-5 h-5 text-white drop-shadow-sm" />
              </div>
            )}
            <div className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'} max-w-3xl flex-1 min-w-0`}>
              <div className="flex items-center gap-2 mb-2 px-1.5">
                <span className={`text-xs font-semibold tracking-wide ${
                  message.role === 'user' ? 'text-zinc-300' : 'text-zinc-400'
                }`}>
                  {message.role === 'user' ? 'You' : 'System'}
                </span>
                <span className={`text-xs ${
                  message.role === 'user' ? 'text-zinc-500' : 'text-zinc-600'
                }`}>•</span>
                <span className={`text-xs ${
                  message.role === 'user' ? 'text-zinc-500' : 'text-zinc-600'
                }`}>
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div
                className={`relative rounded-2xl px-6 py-5 shadow-xl transition-all duration-200 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-[#00A99D] to-[#008c82] text-white rounded-br-sm shadow-[#00A99D]/25 hover:shadow-2xl hover:shadow-[#00A99D]/30'
                    : 'bg-zinc-800/95 backdrop-blur-sm text-zinc-100 rounded-bl-sm border border-zinc-700/60 hover:border-zinc-600/80 hover:shadow-2xl hover:bg-zinc-800'
                } ${message.content.length > 1000 ? 'max-h-[600px] overflow-y-auto message-scroll' : ''}`}
              >
                {(message.content || message.isTyping) && (
                  <div className={`text-[15px] leading-[1.75] break-words font-normal antialiased ${
                    message.role === 'assistant' ? 'text-zinc-50' : 'text-white'
                  }`}>
                    <div className="message-content">
                      {message.content.split('\n').map((line, index, array) => {
                        const trimmed = line.trim();
                        const isSeparator = trimmed.startsWith('━') || trimmed.startsWith('─') || trimmed === '---';
                        const isEmpty = trimmed === '';
                        const hasBullet = trimmed.startsWith('•') || (trimmed.startsWith('-') && trimmed.length > 1);
                        const isIndentedBullet = line.match(/^\s{2,}[•\-]/);
                        
                        // Handle separator lines
                        if (isSeparator) {
                          return (
                            <div 
                              key={index}
                              className={`h-[1px] my-6 ${
                                message.role === 'assistant' 
                                  ? 'bg-gradient-to-r from-transparent via-zinc-600/40 to-transparent' 
                                  : 'bg-gradient-to-r from-transparent via-white/25 to-transparent'
                              }`}
                            />
                          );
                        }
                        
                        // Handle section headers (all caps, short lines, not bullets)
                        if (trimmed.length > 0 && trimmed.length < 50 && trimmed === trimmed.toUpperCase() && trimmed.length > 3 && !hasBullet) {
                          return (
                            <div key={index} className={`font-bold text-base mt-7 mb-4 first:mt-0 tracking-tight ${
                              message.role === 'assistant' ? 'text-zinc-50' : 'text-white'
                            }`}>
                              {line}
                            </div>
                          );
                        }
                        
                        // Handle bullet points with nice styling
                        if (hasBullet || isIndentedBullet) {
                          const bulletMatch = line.match(/^(\s*)[•\-]\s*(.*)$/);
                          if (bulletMatch) {
                            const [, spaces, content] = bulletMatch;
                            const indentLevel = spaces.length;
                            const isSubBullet = indentLevel >= 2;
                            
                            if (!content.trim() && trimmed.length <= 2) {
                              return <div key={index} className="h-0.5" />;
                            }
                            
                            return (
                              <div key={index} className={`flex items-start gap-3 ${isSubBullet ? 'ml-4' : ''} my-0.5`}>
                                <span className={`mt-[7px] ${isSubBullet ? 'text-sm' : 'text-lg'} leading-none flex-shrink-0 ${
                                  message.role === 'assistant' 
                                    ? isSubBullet ? 'text-zinc-500' : 'text-zinc-400'
                                    : isSubBullet ? 'text-white/75' : 'text-white/90'
                                }`}>{isSubBullet ? '◦' : '•'}</span>
                                <span className="flex-1 leading-[1.75]">{content || '\u00A0'}</span>
                              </div>
                            );
                          }
                        }
                        
                        // Regular content - preserve original formatting with nice spacing
                        return (
                          <div key={index} className={`leading-[1.75] ${isEmpty ? 'h-1.5' : 'my-0.5'}`}>
                            {isEmpty ? '\u00A0' : line}
                          </div>
                        );
                      })}
                    </div>
                    {message.isTyping && (
                      <span className="inline-block w-1.5 h-4 ml-1.5 bg-current animate-pulse align-middle mt-1">|</span>
                    )}
                  </div>
                )}
                {message.files && message.files.length > 0 && (
                  <div className="mt-4 space-y-2.5">
                    {message.files.map((file, fileIndex) => (
                      <div
                        key={fileIndex}
                        className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                          message.role === 'user' 
                            ? 'bg-white/15 backdrop-blur-sm border border-white/20 hover:bg-white/20' 
                            : 'bg-zinc-900/60 border border-zinc-700/60 hover:bg-zinc-900/80'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg ${
                          message.role === 'user' 
                            ? 'bg-white/20' 
                            : 'bg-zinc-700/50'
                        }`}>
                          <FileText className={`w-4 h-4 ${
                            message.role === 'user' ? 'text-white' : 'text-zinc-300'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className={`text-sm font-medium block truncate ${
                            message.role === 'user' ? 'text-white' : 'text-zinc-200'
                          }`}>
                            {file.name}
                          </span>
                          <span className={`text-xs mt-0.5 ${
                            message.role === 'user' ? 'text-white/70' : 'text-zinc-500'
                          }`}>
                            {(file.size / 1024).toFixed(1)} KB
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {message.role === 'user' && (
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-zinc-600 via-zinc-600 to-zinc-700 flex items-center justify-center shadow-lg ring-2 ring-zinc-800/50 ring-offset-2 ring-offset-zinc-900">
                <User className="w-5 h-5 text-white drop-shadow-sm" />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Composer */}
      <div className="border-t border-zinc-800 p-6 bg-zinc-950/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          {/* Attached Files Preview */}
          {uploadedFiles.length > 0 && (
            <div className="mb-4 space-y-2">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg border border-zinc-700"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#00A99D]" />
                    <span className="text-sm font-medium text-white">{file.name}</span>
                    <span className="text-xs text-zinc-500">({(file.size / 1024).toFixed(1)} KB)</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFile(index)}
                    className="h-6 w-6 p-0 text-zinc-400 hover:text-zinc-100"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800 shadow-lg hover:border-zinc-700 transition-colors">
            <div className="p-4">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Describe your project and training goals, then attach your files..."
                className="w-full bg-transparent border-0 focus:ring-0 focus-visible:ring-0 resize-none text-zinc-100 placeholder:text-zinc-500 min-h-[80px]"
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between px-4 pb-4 pt-2 border-t border-zinc-800/50">
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".txt,.json,.md,.csv,.xlsx,.xls,.pdf,.doc,.docx,.yaml,.yml,.xml,.tsv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-zinc-400 hover:text-zinc-100"
                >
                  <Paperclip className="w-4 h-4 mr-2" />
                  Attach Files
                </Button>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-500">{input.length} characters</span>
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() && uploadedFiles.length === 0}
                  className="bg-[#00A99D] hover:bg-[#008c82] disabled:bg-zinc-800 disabled:text-zinc-600"
                >
                  <span>Send</span>
                  <Send className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
          <p className="text-xs text-zinc-600 text-center mt-3">
            Press <kbd className="px-2 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-zinc-400">Enter</kbd> to send, <kbd className="px-2 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-zinc-400">Shift + Enter</kbd> for new line
          </p>
        </div>
      </div>
    </div>
  );
}
