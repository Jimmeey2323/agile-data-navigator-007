import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Key, 
  Settings, 
  Zap, 
  CheckCircle, 
  AlertCircle, 
  Info,
  Sparkles,
  Target,
  MessageSquare,
  BarChart3,
  Lightbulb,
  Save,
  TestTube,
  Shield,
  Cpu
} from 'lucide-react';
import { aiService, AIConfig } from '@/services/aiService';
import { toast } from 'sonner';

interface AISettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AISettingsModal({ isOpen, onClose }: AISettingsModalProps) {
  const [config, setConfig] = useState<AIConfig>({
    apiKey: '',
    model: 'gpt-4',
    temperature: 0.7
  });
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    const existingConfig = aiService.loadConfig();
    if (existingConfig) {
      setConfig(existingConfig);
      setIsConfigured(true);
    }
  }, []);

  const handleSave = async () => {
    if (!config.apiKey.trim()) {
      toast.error('Please enter your OpenAI API key');
      return;
    }

    setIsLoading(true);
    try {
      aiService.initialize(config);
      setIsConfigured(true);
      toast.success('AI settings saved successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to save AI settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTest = async () => {
    if (!config.apiKey.trim()) {
      toast.error('Please enter your API key first');
      return;
    }

    setIsLoading(true);
    setTestResult(null);

    try {
      // Temporarily initialize with current config for testing
      aiService.initialize(config);
      
      const testPrompt = 'Respond with "AI connection successful!" if you can read this message.';
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: config.model,
          messages: [{ role: 'user', content: testPrompt }],
          max_tokens: 50,
        }),
      });

      if (response.ok) {
        setTestResult('✅ Connection successful! AI features are ready to use.');
        toast.success('API connection test passed!');
      } else {
        const error = await response.json();
        setTestResult(`❌ Connection failed: ${error.error?.message || 'Unknown error'}`);
        toast.error('API connection test failed');
      }
    } catch (error) {
      setTestResult(`❌ Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast.error('API connection test failed');
    } finally {
      setIsLoading(false);
    }
  };

  const aiFeatures = [
    {
      icon: <Brain className="h-5 w-5 text-blue-500" />,
      title: 'Smart Lead Scoring',
      description: 'AI-powered lead scoring with detailed factor analysis and recommendations'
    },
    {
      icon: <Target className="h-5 w-5 text-green-500" />,
      title: 'Conversion Predictions',
      description: 'Predict lead conversion probability and optimal timing for follow-ups'
    },
    {
      icon: <MessageSquare className="h-5 w-5 text-purple-500" />,
      title: 'Smart Follow-up Suggestions',
      description: 'Generate personalized follow-up strategies based on lead behavior'
    },
    {
      icon: <BarChart3 className="h-5 w-5 text-orange-500" />,
      title: 'Advanced Analytics',
      description: 'Deep insights into lead patterns, conversion factors, and optimization opportunities'
    },
    {
      icon: <Lightbulb className="h-5 w-5 text-yellow-500" />,
      title: 'Automated Insights',
      description: 'Continuous analysis of your lead data with actionable recommendations'
    },
    {
      icon: <Sparkles className="h-5 w-5 text-pink-500" />,
      title: 'Email Templates',
      description: 'Generate personalized email templates for different lead stages and scenarios'
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 bg-white border-0 shadow-2xl rounded-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 px-8 py-6 bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 text-white shadow-lg">
          <DialogHeader>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-white">
                  AI Configuration Center
                </DialogTitle>
                <p className="text-blue-100 mt-1">
                  Configure OpenAI integration to unlock advanced AI-powered features
                </p>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="setup" className="h-full flex flex-col">
            <div className="flex-shrink-0 px-8 py-4 bg-gray-50 border-b">
              <TabsList className="grid grid-cols-3 w-full bg-white shadow-sm rounded-xl border">
                <TabsTrigger value="setup" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
                  <Settings className="h-4 w-4" />
                  Setup
                </TabsTrigger>
                <TabsTrigger value="features" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
                  <Zap className="h-4 w-4" />
                  Features
                </TabsTrigger>
                <TabsTrigger value="advanced" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
                  <Cpu className="h-4 w-4" />
                  Advanced
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto">
              <TabsContent value="setup" className="mt-0 p-8 space-y-6">
                <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-800">
                      <Key className="h-5 w-5" />
                      OpenAI API Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="apiKey" className="text-sm font-semibold text-gray-700">
                        API Key *
                      </Label>
                      <Input
                        id="apiKey"
                        type="password"
                        placeholder="sk-..."
                        value={config.apiKey}
                        onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                        className="mt-1 font-mono text-sm"
                      />
                      <p className="text-xs text-gray-600 mt-1">
                        Get your API key from{' '}
                        <a 
                          href="https://platform.openai.com/api-keys" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          OpenAI Platform
                        </a>
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="model" className="text-sm font-semibold text-gray-700">
                        Model
                      </Label>
                      <Select value={config.model} onValueChange={(value) => setConfig({ ...config, model: value })}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gpt-4">GPT-4 (Recommended)</SelectItem>
                          <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                          <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (Faster)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold text-gray-700">
                        Temperature: {config.temperature}
                      </Label>
                      <Slider
                        value={[config.temperature]}
                        onValueChange={([value]) => setConfig({ ...config, temperature: value })}
                        max={1}
                        min={0}
                        step={0.1}
                        className="mt-2"
                      />
                      <p className="text-xs text-gray-600 mt-1">
                        Lower values = more focused, Higher values = more creative
                      </p>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button 
                        onClick={handleTest} 
                        disabled={isLoading || !config.apiKey.trim()}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <TestTube className="h-4 w-4" />
                        Test Connection
                      </Button>
                      
                      <Button 
                        onClick={handleSave} 
                        disabled={isLoading}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                      >
                        <Save className="h-4 w-4" />
                        Save Configuration
                      </Button>
                    </div>

                    {testResult && (
                      <div className={`p-3 rounded-lg text-sm ${
                        testResult.includes('✅') 
                          ? 'bg-green-50 text-green-800 border border-green-200' 
                          : 'bg-red-50 text-red-800 border border-red-200'
                      }`}>
                        {testResult}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {isConfigured && (
                  <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                        <div>
                          <h3 className="font-semibold text-green-800">AI Features Enabled</h3>
                          <p className="text-sm text-green-700">
                            Your OpenAI integration is active and ready to enhance your lead management experience.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="features" className="mt-0 p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {aiFeatures.map((feature, index) => (
                    <Card key={index} className="border-gray-200 hover:shadow-lg transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            {feature.icon}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800 mb-2">{feature.title}</h3>
                            <p className="text-sm text-gray-600">{feature.description}</p>
                            <Badge 
                              className={`mt-2 ${isConfigured ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}
                            >
                              {isConfigured ? 'Available' : 'Requires Setup'}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="mt-0 p-8 space-y-6">
                <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-violet-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-purple-800">
                      <Shield className="h-5 w-5" />
                      Security & Privacy
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-gray-800">Data Privacy</h4>
                        <p className="text-sm text-gray-600">
                          Your API key is stored locally in your browser and never sent to our servers. 
                          Lead data is only sent to OpenAI for analysis when you explicitly use AI features.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-gray-800">Usage Costs</h4>
                        <p className="text-sm text-gray-600">
                          AI features use your OpenAI API credits. Monitor your usage on the OpenAI platform 
                          to avoid unexpected charges.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-800">
                      <Cpu className="h-5 w-5" />
                      Performance Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-semibold text-gray-700">Max Tokens</Label>
                        <Input 
                          type="number" 
                          defaultValue="2000" 
                          className="mt-1"
                          disabled
                        />
                        <p className="text-xs text-gray-600 mt-1">Maximum response length</p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-semibold text-gray-700">Timeout (seconds)</Label>
                        <Input 
                          type="number" 
                          defaultValue="30" 
                          className="mt-1"
                          disabled
                        />
                        <p className="text-xs text-gray-600 mt-1">Request timeout duration</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-8 py-4 bg-gray-50 border-t">
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Save & Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}