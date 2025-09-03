import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Loader2, RefreshCw, Image } from 'lucide-react';
import { toast } from 'sonner';

interface FalModel {
  id: string;
  name: string;
  description: string;
  type: string;
}

interface LocalImageModel {
  id: string;
  model_name: string;
  display_name: string;
  is_active: boolean;
}

export default function FalModels() {
  const [availableModels, setAvailableModels] = useState<FalModel[]>([]);
  const [localModels, setLocalModels] = useState<LocalImageModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchAvailableModels = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch('/api/admin/fal/models', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const models = await response.json();
        setAvailableModels(models);
      }
    } catch (error) {
      console.error('Error fetching available models:', error);
      toast.error('Failed to fetch available models');
    }
  };

  const fetchLocalModels = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch('/api/admin/image-models', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const models = await response.json();
        setLocalModels(models);
      }
    } catch (error) {
      console.error('Error fetching local models:', error);
      toast.error('Failed to fetch local models');
    }
  };

  const toggleModel = async (modelId: string, isActive: boolean) => {
    setUpdating(modelId);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch(`/api/admin/image-models/${modelId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_active: isActive })
      });

      if (response.ok) {
        setLocalModels(prev => 
          prev.map(model => 
            model.id === modelId ? { ...model, is_active: isActive } : model
          )
        );
        toast.success(`Model ${isActive ? 'activated' : 'deactivated'}`);
      } else {
        throw new Error('Failed to update model');
      }
    } catch (error) {
      console.error('Error updating model:', error);
      toast.error('Failed to update model');
    } finally {
      setUpdating(null);
    }
  };

  const addModel = async (availableModel: FalModel) => {
    setUpdating(availableModel.id);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      // Get Fal provider ID
      const providersResponse = await fetch('/api/admin/image-providers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!providersResponse.ok) throw new Error('Failed to get providers');
      
      const providers = await providersResponse.json();
      const falProvider = providers.find((p: any) => p.provider_type === 'fal' || p.name.toLowerCase().includes('fal'));
      
      if (!falProvider) throw new Error('Fal.ai provider not found');

      const response = await fetch('/api/admin/image-models', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          provider_id: falProvider.id,
          model_name: availableModel.id,
          display_name: availableModel.name,
          image_size: '1024x1024',
          quality: 'standard',
          style: 'natural',
          cost_per_image: 0.015,
          max_batch_size: 1,
          supports_negative_prompt: true,
          supports_controlnet: false,
          is_active: true
        })
      });

      if (response.ok) {
        const newModel = await response.json();
        setLocalModels(prev => [...prev, newModel]);
        toast.success('Model added successfully');
      } else {
        throw new Error('Failed to add model');
      }
    } catch (error) {
      console.error('Error adding model:', error);
      toast.error('Failed to add model');
    } finally {
      setUpdating(null);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchAvailableModels(), fetchLocalModels()]);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Active Models */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Active Fal.ai Models</CardTitle>
              <CardDescription>Models currently available for image generation</CardDescription>
            </div>
            <Button onClick={() => { fetchAvailableModels(); fetchLocalModels(); }} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {localModels.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No models configured. Add models from the available models below.
              </p>
            ) : (
              localModels.map((model) => (
                <div key={model.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Image className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="font-medium">{model.display_name}</p>
                      <p className="text-sm text-muted-foreground">{model.model_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge variant={model.is_active ? "default" : "secondary"}>
                      {model.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <Switch
                      checked={model.is_active}
                      onCheckedChange={(checked) => toggleModel(model.id, checked)}
                      disabled={updating === model.id}
                    />
                    {updating === model.id && <Loader2 className="h-4 w-4 animate-spin" />}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Available Models */}
      <Card>
        <CardHeader>
          <CardTitle>Available Fal.ai Models</CardTitle>
          <CardDescription>Add new models from Fal.ai's catalog</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {availableModels.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No models available. Check your Fal.ai API key.
              </p>
            ) : (
              availableModels
                .filter(model => !localModels.some(local => local.model_name === model.id))
                .map((model) => (
                  <div key={model.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{model.name}</p>
                        <Badge variant="outline" className="text-xs">
                          {model.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{model.id}</p>
                      <p className="text-xs text-muted-foreground">
                        {model.description}
                      </p>
                    </div>
                    <Button
                      onClick={() => addModel(model)}
                      disabled={updating === model.id}
                      size="sm"
                    >
                      {updating === model.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Add Model'
                      )}
                    </Button>
                  </div>
                ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}