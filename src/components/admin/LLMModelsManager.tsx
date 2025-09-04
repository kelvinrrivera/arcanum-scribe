import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Loader2, TestTube, CheckCircle, XCircle, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface LLMProvider {
  id: string;
  name: string;
  provider_type: string;
  is_active: boolean;
  priority: number;
}

interface LLMModel {
  id: string;
  provider_id: string;
  model_name: string;
  display_name: string;
  model_type: string;
  max_tokens: number;
  temperature: number;
  is_active: boolean;
  cost_per_1m_tokens: number;
  provider_name: string;
  provider_type: string;
}

export default function LLMModelsManager() {
  const [providers, setProviders] = useState<LLMProvider[]>([]);
  const [models, setModels] = useState<LLMModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; response?: string; error?: string }>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error('Authentication required');
        setLoading(false);
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      // Fetch providers
      const providersResponse = await fetch('/api/admin/llm-providers', { headers });
      if (providersResponse.ok) {
        const providersData = await providersResponse.json();
        setProviders(providersData.providers || []);
      }

      // Fetch models
      const modelsResponse = await fetch('/api/admin/llm-models', { headers });
      if (modelsResponse.ok) {
        const modelsData = await modelsResponse.json();
        setModels(modelsData.models || []);
      }

    } catch (error) {
      console.error('Error fetching LLM data:', error);
      toast.error('Failed to fetch LLM configuration');
    } finally {
      setLoading(false);
    }
  };

  const updateModelStatus = async (modelId: string, isActive: boolean) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch(`/api/admin/llm-models/${modelId}`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ is_active: isActive })
      });

      if (!response.ok) throw new Error('Failed to update model');
      
      setModels(prev => prev.map(model => 
        model.id === modelId ? { ...model, is_active: isActive } : model
      ));
      
      toast.success(`Model ${isActive ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      toast.error('Failed to update model status');
    }
  };

  const testModel = async (model: LLMModel) => {
    setTesting(model.id);
    
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error('Authentication required');
        setTesting(null);
        return;
      }

      const response = await fetch('/api/admin/test-llm-model', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
          model_name: model.model_name,
          provider_type: model.provider_type
        })
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        setTestResults(prev => ({
          ...prev,
          [model.id]: { 
            success: true, 
            response: result.response 
          }
        }));
        toast.success(`${model.display_name} test successful!`);
      } else {
        setTestResults(prev => ({
          ...prev,
          [model.id]: { 
            success: false, 
            error: result.error || 'Test failed' 
          }
        }));
        toast.error(`${model.display_name} test failed: ${result.error}`);
      }
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [model.id]: { 
          success: false, 
          error: error.message 
        }
      }));
      toast.error(`Test failed: ${error.message}`);
    } finally {
      setTesting(null);
    }
  };

  const formatCost = (cost: number | string | null | undefined): string => {
    const numCost = typeof cost === 'number' ? cost : parseFloat(String(cost || 0));
    if (isNaN(numCost)) return '$0.00';
    if (numCost < 1) return `$${numCost.toFixed(3)}`;
    return `$${numCost.toFixed(2)}`;
  };

  const getProviderColor = (providerType: string): string => {
    switch (providerType) {
      case 'anthropic': return 'bg-orange-500/10 text-orange-600 dark:text-orange-400';
      case 'openai': return 'bg-green-500/10 text-green-600 dark:text-green-400';
      case 'google': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading LLM configuration...</span>
      </div>
    );
  }

  // Group models by provider
  const modelsByProvider = models.reduce((acc, model) => {
    if (!acc[model.provider_type]) {
      acc[model.provider_type] = [];
    }
    acc[model.provider_type].push(model);
    return acc;
  }, {} as Record<string, LLMModel[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">🤖 LLM Models Management</h2>
          <p className="text-muted-foreground">Manage language models and test API connectivity</p>
        </div>
        <Button onClick={fetchData} variant="outline">
          <Zap className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Providers Overview */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Providers Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {providers.map(provider => {
              const providerModels = modelsByProvider[provider.provider_type] || [];
              const activeModels = providerModels.filter(m => m.is_active).length;
              
              return (
                <div key={provider.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{provider.name}</h3>
                    <Badge className={getProviderColor(provider.provider_type)}>
                      {provider.provider_type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {activeModels}/{providerModels.length} models active
                  </p>
                  <p className="text-xs text-muted-foreground">Priority: {provider.priority}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Models by Provider */}
      {Object.entries(modelsByProvider).map(([providerType, providerModels]) => {
        const provider = providers.find(p => p.provider_type === providerType);
        if (!provider) return null;

        return (
          <Card key={providerType}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge className={getProviderColor(providerType)}>
                  {provider.name}
                </Badge>
                <span>{providerModels.length} models</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {providerModels.map(model => {
                  const testResult = testResults[model.id];
                  
                  return (
                    <div
                      key={model.id}
                      className={`p-4 border rounded-lg ${
                        model.is_active ? 'border-green-500/20 bg-green-500/10' : 'border-border bg-card'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium">{model.display_name}</h4>
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {model.model_name}
                            </code>
                            <Badge variant={model.is_active ? 'default' : 'secondary'}>
                              {model.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>💰 {formatCost(model.cost_per_1m_tokens)}/1M tokens</span>
                            <span>🎯 Max: {model.max_tokens.toLocaleString()} tokens</span>
                            <span>🌡️ Temp: {model.temperature}</span>
                          </div>

                          {testResult && (
                            <div className={`mt-2 p-2 rounded text-sm ${
                              testResult.success 
                                ? 'bg-green-500/10 text-green-600 dark:text-green-400' 
                                : 'bg-red-500/10 text-red-600 dark:text-red-400'
                            }`}>
                              {testResult.success ? (
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="h-4 w-4" />
                                  <span>Test successful: "{testResult.response}"</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <XCircle className="h-4 w-4" />
                                  <span>Test failed: {testResult.error}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => testModel(model)}
                            disabled={!model.is_active || testing === model.id}
                            variant="outline"
                            size="sm"
                          >
                            {testing === model.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <TestTube className="h-4 w-4" />
                            )}
                            Test
                          </Button>
                          
                          <Switch
                            checked={model.is_active}
                            onCheckedChange={(checked) => updateModelStatus(model.id, checked)}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {models.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No LLM models found.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Run the model update script to add the latest models.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}