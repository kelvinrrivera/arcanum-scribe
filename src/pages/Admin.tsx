import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { 
  Loader2, Plus, Edit, Trash2, Copy, Check, Settings, 
  Activity, Database, Zap, Image, TestTube, BarChart3,
  AlertTriangle, CheckCircle, XCircle, Clock, Eye,
  RefreshCw, Download, Upload, Filter, Search, Users,
  Key, Mail, Calendar
} from 'lucide-react';
// OpenRouter removed - using Vercel AI SDK now
import FalModelsManager from '@/components/admin/FalModelsManager';
import LLMModelsManager from '@/components/admin/LLMModelsManager';

// Interfaces
interface LLMProvider {
  id: string;
  name: string;
  provider_type: 'anthropic' | 'openai' | 'google' | 'custom';
  base_url: string;
  api_key_env: string;
  is_active: boolean;
  priority: number;
  config: any;
  created_at: string;
  updated_at: string;
}

interface LLMModel {
  id: string;
  provider_id: string;
  model_name: string;
  display_name: string;
  model_type: 'chat' | 'completion' | 'instruct';
  max_tokens: number;
  temperature: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  is_active: boolean;
  cost_per_1m_tokens: number;
  context_window: number;
  supports_functions: boolean;
  supports_vision: boolean;
  provider_name?: string;
  created_at: string;
  updated_at: string;
}

interface ImageProvider {
  id: string;
  name: string;
  provider_type: 'fal' | 'openai' | 'midjourney' | 'stable_diffusion' | 'custom';
  base_url: string;
  api_key_env: string;
  is_active: boolean;
  priority: number;
  config: any;
  created_at: string;
  updated_at: string;
}

interface ImageModel {
  id: string;
  provider_id: string;
  model_name: string;
  display_name: string;
  image_size: string;
  quality: 'standard' | 'hd' | 'ultra';
  style: string;
  is_active: boolean;
  cost_per_image: number;
  max_batch_size: number;
  supports_negative_prompt: boolean;
  supports_controlnet: boolean;
  provider_name?: string;
  created_at: string;
  updated_at: string;
}

interface PromptLog {
  id: string;
  user_id: string;
  provider_id: string;
  model_id: string;
  prompt_type: 'adventure' | 'npc' | 'monster' | 'item' | 'image';
  prompt_text: string;
  response_text: string;
  tokens_used: number;
  cost: number;
  response_time_ms: number;
  success: boolean;
  error_message?: string;
  metadata: any;
  user_email?: string;
  provider_name?: string;
  model_name?: string;
  created_at: string;
}

interface SystemStats {
  totalRequests: number;
  successRate: number;
  avgResponseTime: number;
  totalCost: number;
  totalTokens: number;
}

interface User {
  id: string;
  email: string;
  display_name: string;
  subscription_tier: string;
  credits_remaining: number;
  monthly_generations: number;
  created_at: string;
}

interface InviteCode {
  id: string;
  code: string;
  created_by: string;
  used_by?: string;
  used_at?: string;
  created_at: string;
}

export default function Admin() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [clearingLogs, setClearingLogs] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Data states
  const [users, setUsers] = useState<User[]>([]);
  const [llmProviders, setLlmProviders] = useState<LLMProvider[]>([]);
  const [llmModels, setLlmModels] = useState<LLMModel[]>([]);
  const [imageProviders, setImageProviders] = useState<ImageProvider[]>([]);
  const [imageModels, setImageModels] = useState<ImageModel[]>([]);
  const [promptLogs, setPromptLogs] = useState<PromptLog[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  
  // UI states
  const [editingProvider, setEditingProvider] = useState<LLMProvider | null>(null);
  const [editingModel, setEditingModel] = useState<LLMModel | null>(null);
  const [editingImageProvider, setEditingImageProvider] = useState<ImageProvider | null>(null);
  const [editingImageModel, setEditingImageModel] = useState<ImageModel | null>(null);
  const [showProviderDialog, setShowProviderDialog] = useState(false);
  const [showModelDialog, setShowModelDialog] = useState(false);
  const [showImageProviderDialog, setShowImageProviderDialog] = useState(false);
  const [showImageModelDialog, setShowImageModelDialog] = useState(false);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  // Form states
  const [newProvider, setNewProvider] = useState<Partial<LLMProvider>>({
    name: '',
    provider_type: 'anthropic',
    base_url: '',
    api_key_env: '',
    is_active: true,
    priority: 0,
    config: {}
  });
  
  const [newModel, setNewModel] = useState<Partial<LLMModel>>({
    provider_id: '',
    model_name: '',
    display_name: '',
    model_type: 'chat',
    max_tokens: 4096,
    temperature: 0.7,
    top_p: 1.0,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
    is_active: true,
    cost_per_1m_tokens: 0.0,
    context_window: 4096,
    supports_functions: false,
    supports_vision: false
  });
  
  const [newImageProvider, setNewImageProvider] = useState<Partial<ImageProvider>>({
    name: '',
    provider_type: 'fal',
    base_url: '',
    api_key_env: '',
    is_active: true,
    priority: 0,
    config: {}
  });
  
  const [newImageModel, setNewImageModel] = useState<Partial<ImageModel>>({
    provider_id: '',
    model_name: '',
    display_name: '',
    image_size: '1024x1024',
    quality: 'standard',
    style: 'natural',
    is_active: true,
    cost_per_image: 0.0,
    max_batch_size: 1,
    supports_negative_prompt: false,
    supports_controlnet: false
  });

  useEffect(() => {
    if (user?.subscription_tier === 'admin') {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error('No authentication token found');
        return;
      }
      
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      const [
        usersRes, 
        providersRes, 
        modelsRes, 
        imageProvidersRes, 
        imageModelsRes,
        promptLogsRes,
        statsRes,
        inviteCodesRes
      ] = await Promise.all([
        fetch('/api/admin/users', { headers }),
        fetch('/api/admin/llm-providers', { headers }),
        fetch('/api/admin/llm-models', { headers }),
        fetch('/api/admin/image-providers', { headers }),
        fetch('/api/admin/image-models', { headers }),
        fetch('/api/admin/prompt-logs?limit=50', { headers }),
        fetch('/api/admin/stats/usage?days=7', { headers }),
        fetch('/api/admin/invite-codes', { headers })
      ]);

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);
      }
      if (providersRes.ok) {
        const providersData = await providersRes.json();
        setLlmProviders(providersData.providers || []);
      }
      if (modelsRes.ok) {
        const modelsData = await modelsRes.json();
        setLlmModels(modelsData.models || []);
      }
      if (imageProvidersRes.ok) {
        const imageProvidersData = await imageProvidersRes.json();
        setImageProviders(Array.isArray(imageProvidersData) ? imageProvidersData : imageProvidersData.providers || []);
      }
      if (imageModelsRes.ok) {
        const imageModelsData = await imageModelsRes.json();
        setImageModels(Array.isArray(imageModelsData) ? imageModelsData : imageModelsData.models || []);
      }
      if (inviteCodesRes.ok) {
        const inviteCodesData = await inviteCodesRes.json();
        setInviteCodes(Array.isArray(inviteCodesData) ? inviteCodesData : inviteCodesData.codes || []);
      }
      
      if (promptLogsRes.ok) {
        const logsData = await promptLogsRes.json();
        setPromptLogs(logsData.logs || []);
      }
      
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        // Calculate system stats from logs data
        const totalRequests = Array.isArray(statsData) ? statsData.reduce((sum: number, stat: any) => sum + (stat.count || 0), 0) : 0;
        const avgResponseTime = Array.isArray(statsData) && statsData.length > 0 
          ? statsData.reduce((sum: number, stat: any) => sum + (stat.avg_response_time || 0), 0) / statsData.length 
          : 0;
        const successfulRequests = Array.isArray(statsData) ? statsData.reduce((sum: number, stat: any) => sum + (stat.successful_requests || 0), 0) : 0;
        
        setSystemStats({
          totalRequests,
          successRate: totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0,
          avgResponseTime: avgResponseTime || 0,
          totalCost: 0, // Will be calculated from actual cost data later
          totalTokens: 0 // Will be calculated from actual token data later
        });
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  // Invite Codes Management
  const createInviteCode = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch('/api/admin/invite-codes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          code: Math.random().toString(36).substring(2, 15).toUpperCase()
        })
      });

      if (response.ok) {
        const newCode = await response.json();
        setInviteCodes(prev => [newCode, ...prev]);
        toast.success('Invite code created successfully!');
        fetchData(); // Refresh data
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create invite code');
      }
    } catch (error: any) {
      console.error('Create invite code error:', error);
      toast.error(error.message || 'Failed to create invite code');
    }
  };

  const deleteInviteCode = async (id: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch(`/api/admin/invite-codes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setInviteCodes(prev => prev.filter(code => code.id !== id));
        toast.success('Invite code deleted successfully!');
      } else {
        throw new Error('Failed to delete invite code');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete invite code');
    }
  };

  const copyInviteCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success('Invite code copied to clipboard!');
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      toast.error('Failed to copy invite code');
    }
  };

  // Provider management functions
  const createProvider = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch('/api/admin/llm-providers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newProvider)
      });

      if (response.ok) {
        const provider = await response.json();
        setLlmProviders(prev => [...prev, provider]);
        setNewProvider({
          name: '',
          provider_type: 'anthropic',
          base_url: '',
          api_key_env: '',
          is_active: true,
          priority: 0,
          config: {}
        });
        setShowProviderDialog(false);
        toast.success('Provider created successfully!');
      } else {
        throw new Error('Failed to create provider');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create provider');
    }
  };

  const testProviderConnection = async (providerId: string) => {
    try {
      setTestingProvider(providerId);
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch(`/api/admin/llm-providers/${providerId}/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          toast.success(`Connection successful! Response time: ${result.responseTime}ms`);
        } else {
          toast.error(`Connection failed: ${result.message}`);
        }
      } else {
        throw new Error('Failed to test connection');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to test connection');
    } finally {
      setTestingProvider(null);
    }
  };

  const createModel = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch('/api/admin/llm-models', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newModel)
      });

      if (response.ok) {
        const model = await response.json();
        setLlmModels(prev => [...prev, model]);
        setNewModel({
          provider_id: '',
          model_name: '',
          display_name: '',
          model_type: 'chat',
          max_tokens: 4096,
          temperature: 0.7,
          top_p: 1.0,
          frequency_penalty: 0.0,
          presence_penalty: 0.0,
          is_active: true,
          cost_per_1m_tokens: 0.0,
          context_window: 4096,
          supports_functions: false,
          supports_vision: false
        });
        setShowModelDialog(false);
        toast.success('Model created successfully!');
      } else {
        throw new Error('Failed to create model');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create model');
    }
  };

  const updateProvider = async (provider: LLMProvider) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch(`/api/admin/llm-providers/${provider.id}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(provider)
      });

      if (response.ok) {
        const updatedProvider = await response.json();
        setLlmProviders(prev => prev.map(p => p.id === provider.id ? updatedProvider : p));
        toast.success('Provider updated successfully!');
        setEditingProvider(null);
      } else {
        throw new Error('Failed to update provider');
      }
    } catch (error: any) {
      console.error('Error updating provider:', error);
      toast.error(error.message || 'Failed to update provider');
    }
  };

  const updateModel = async (model: LLMModel) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch(`/api/admin/llm-models/${model.id}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(model)
      });

      if (response.ok) {
        const updatedModel = await response.json();
        setLlmModels(prev => prev.map(m => m.id === model.id ? updatedModel : m));
        toast.success('Model updated successfully!');
        setEditingModel(null);
      } else {
        throw new Error('Failed to update model');
      }
    } catch (error: any) {
      console.error('Error updating model:', error);
      toast.error(error.message || 'Failed to update model');
    }
  };

  const updateImageProvider = async (provider: ImageProvider) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch(`/api/admin/image-providers/${provider.id}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(provider)
      });

      if (response.ok) {
        const updatedProvider = await response.json();
        setImageProviders(prev => prev.map(p => p.id === provider.id ? updatedProvider : p));
        toast.success('Image provider updated successfully!');
        setEditingImageProvider(null);
      } else {
        throw new Error('Failed to update image provider');
      }
    } catch (error: any) {
      console.error('Error updating image provider:', error);
      toast.error(error.message || 'Failed to update image provider');
    }
  };

  const updateImageModel = async (model: ImageModel) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch(`/api/admin/image-models/${model.id}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(model)
      });

      if (response.ok) {
        const updatedModel = await response.json();
        setImageModels(prev => prev.map(m => m.id === model.id ? updatedModel : m));
        toast.success('Image model updated successfully!');
        setEditingImageModel(null);
      } else {
        throw new Error('Failed to update image model');
      }
    } catch (error: any) {
      console.error('Error updating image model:', error);
      toast.error(error.message || 'Failed to update image model');
    }
  };

  const deleteProvider = async (id: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch(`/api/admin/llm-providers/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setLlmProviders(prev => prev.filter(p => p.id !== id));
        toast.success('Provider deleted successfully!');
      } else {
        throw new Error('Failed to delete provider');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete provider');
    }
  };

  const deleteModel = async (id: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch(`/api/admin/llm-models/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setLlmModels(prev => prev.filter(m => m.id !== id));
        toast.success('Model deleted successfully!');
      } else {
        throw new Error('Failed to delete model');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete model');
    }
  };

  const bulkUpdateProviders = async (providerIds: string[], updates: Partial<LLMProvider>) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const promises = providerIds.map(id => 
        fetch(`/api/admin/llm-providers/${id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updates)
        })
      );

      await Promise.all(promises);
      
      setLlmProviders(prev => 
        prev.map(p => 
          providerIds.includes(p.id) ? { ...p, ...updates } : p
        )
      );
      
      toast.success(`Updated ${providerIds.length} providers`);
      setSelectedProviders([]);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update providers');
    }
  };

  // Prompt Logs Management
  const clearPromptLogs = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar todos los logs? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setClearingLogs(true);
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch('/api/admin/clear-prompt-logs', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPromptLogs([]);
        toast.success(`Eliminados ${data.deletedCount} logs exitosamente`);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to clear logs');
      }
    } catch (error: any) {
      console.error('Error clearing logs:', error);
      toast.error(error.message || 'Failed to clear logs');
    } finally {
      setClearingLogs(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  // Check if user has admin access
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="text-muted-foreground">Please log in to access the admin panel.</p>
        </div>
      </div>
    );
  }

  if (user?.subscription_tier !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access the admin panel.</p>
          <p className="text-sm text-muted-foreground mt-2">Current tier: {user?.subscription_tier}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2 text-foreground">
            <Settings className="h-8 w-8" />
            Admin Control Panel
          </h1>
          <p className="text-muted-foreground">Complete system management and configuration</p>
        </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="invite-codes" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Invite Codes
          </TabsTrigger>
          <TabsTrigger value="llm-models" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            LLM Models
          </TabsTrigger>
          <TabsTrigger value="image-models" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            Image Models
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Prompt Logs
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* System Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStats?.totalRequests || 0}</div>
                <p className="text-xs text-muted-foreground">Last 7 days</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{typeof systemStats?.successRate === 'number' ? systemStats.successRate.toFixed(1) : '0.0'}%</div>
                <p className="text-xs text-muted-foreground">System reliability</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{typeof systemStats?.avgResponseTime === 'number' ? systemStats.avgResponseTime.toFixed(0) : '0'}ms</div>
                <p className="text-xs text-muted-foreground">Average latency</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${typeof systemStats?.totalCost === 'number' ? systemStats.totalCost.toFixed(2) : '0.00'}</div>
                <p className="text-xs text-muted-foreground">API costs (7 days)</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Button onClick={() => setActiveTab('invite-codes')} variant="outline">
                <Key className="h-4 w-4 mr-2" />
                Manage Invite Codes
              </Button>
              <Button onClick={() => setActiveTab('llm-providers')} variant="outline">
                <Database className="h-4 w-4 mr-2" />
                Manage Providers
              </Button>
              <Button onClick={() => setActiveTab('logs')} variant="outline">
                <Activity className="h-4 w-4 mr-2" />
                View Logs
              </Button>
              <Button onClick={fetchData} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
            </CardContent>
          </Card>

          {/* System Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Providers</CardTitle>
                <CardDescription>LLM and Image providers status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>LLM Providers</span>
                    <span>{Array.isArray(llmProviders) ? llmProviders.filter(p => p.is_active).length : 0}/{Array.isArray(llmProviders) ? llmProviders.length : 0}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ 
                        width: `${Array.isArray(llmProviders) && llmProviders.length > 0 ? (llmProviders.filter(p => p.is_active).length / llmProviders.length) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Image Providers</span>
                    <span>{imageProviders.filter(p => p.is_active).length}/{imageProviders.length}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ 
                        width: `${imageProviders.length > 0 ? (imageProviders.filter(p => p.is_active).length / imageProviders.length) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest system events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {promptLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        {log.success ? (
                          <CheckCircle className="h-3 w-3 text-green-600" />
                        ) : (
                          <XCircle className="h-3 w-3 text-red-600" />
                        )}
                        <span>{log.prompt_type}</span>
                        <Badge variant="outline" className="text-xs">
                          {log.model_name}
                        </Badge>
                      </div>
                      <span className="text-muted-foreground">
                        {new Date(log.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="invite-codes" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Beta Invite Codes</CardTitle>
                  <CardDescription>Manage invite codes for beta testers and early access</CardDescription>
                </div>
                <Button onClick={createInviteCode}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Invite Code
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inviteCodes.map((code) => (
                  <div key={code.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <code className="font-mono text-lg font-bold bg-muted px-2 py-1 rounded">
                            {code.code}
                          </code>
                          {code.used_by ? (
                            <Badge variant="secondary">Used</Badge>
                          ) : (
                            <Badge variant="default">Available</Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Created: {new Date(code.created_at).toLocaleDateString()}
                          </span>
                          {code.used_by && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              Used by: {code.used_by}
                            </span>
                          )}
                          {code.used_at && (
                            <span>Used: {new Date(code.used_at).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyInviteCode(code.code)}
                        disabled={!!code.used_by}
                      >
                        {copiedCode === code.code ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                        Copy
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" disabled={!!code.used_by}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Invite Code</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete the invite code "{code.code}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteInviteCode(code.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
                
                {inviteCodes.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No invite codes created yet. Create your first invite code to start inviting beta testers.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>   
     <TabsContent value="llm-providers" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>LLM Providers</CardTitle>
                  <CardDescription>Manage AI language model providers (Anthropic, OpenAI, Google)</CardDescription>
                </div>
                <div className="flex gap-2">
                  {selectedProviders.length > 0 && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => bulkUpdateProviders(selectedProviders, { is_active: true })}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Activate Selected
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => bulkUpdateProviders(selectedProviders, { is_active: false })}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Deactivate Selected
                      </Button>
                    </>
                  )}
                  <Dialog open={showProviderDialog} onOpenChange={setShowProviderDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Provider
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Add LLM Provider</DialogTitle>
                        <DialogDescription>Configure a new AI language model provider</DialogDescription>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Provider Name</Label>
                          <Input
                            id="name"
                            value={newProvider.name}
                            onChange={(e) => setNewProvider(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g., Anthropic"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="provider_type">Provider Type</Label>
                          <Select
                            value={newProvider.provider_type}
                            onValueChange={(value) => setNewProvider(prev => ({ ...prev, provider_type: value as any }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="anthropic">Anthropic</SelectItem>
                              <SelectItem value="openai">OpenAI</SelectItem>
                              <SelectItem value="google">Google</SelectItem>
                              <SelectItem value="custom">Custom</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="base_url">Base URL</Label>
                          <Input
                            id="base_url"
                            value={newProvider.base_url}
                            onChange={(e) => setNewProvider(prev => ({ ...prev, base_url: e.target.value }))}
                            placeholder="https://api.anthropic.com"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="api_key_env">API Key Environment Variable</Label>
                          <Input
                            id="api_key_env"
                            value={newProvider.api_key_env}
                            onChange={(e) => setNewProvider(prev => ({ ...prev, api_key_env: e.target.value }))}
                            placeholder="ANTHROPIC_API_KEY"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="priority">Priority</Label>
                          <Input
                            id="priority"
                            type="number"
                            value={newProvider.priority}
                            onChange={(e) => setNewProvider(prev => ({ ...prev, priority: parseInt(e.target.value) || 0 }))}
                            placeholder="0"
                          />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="is_active"
                            checked={newProvider.is_active}
                            onCheckedChange={(checked) => setNewProvider(prev => ({ ...prev, is_active: checked }))}
                          />
                          <Label htmlFor="is_active">Active</Label>
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-2 mt-6">
                        <Button variant="outline" onClick={() => setShowProviderDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={createProvider}>
                          Create Provider
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.isArray(llmProviders) ? llmProviders.map((provider) => (
                  <div key={provider.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <input
                        type="checkbox"
                        checked={selectedProviders.includes(provider.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProviders(prev => [...prev, provider.id]);
                          } else {
                            setSelectedProviders(prev => prev.filter(id => id !== provider.id));
                          }
                        }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{provider.name}</p>
                          <Badge variant={provider.provider_type === 'anthropic' ? 'default' : 'secondary'}>
                            {provider.provider_type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{provider.base_url}</p>
                        <p className="text-xs text-muted-foreground">Priority: {provider.priority}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testProviderConnection(provider.id)}
                        disabled={testingProvider === provider.id}
                      >
                        {testingProvider === provider.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <TestTube className="h-4 w-4" />
                        )}
                        Test
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingProvider(provider)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Provider</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {provider.name}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteProvider(provider.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <Switch
                        checked={provider.is_active}
                        onCheckedChange={(checked) => {
                          const updated = { ...provider, is_active: checked };
                          updateProvider(updated);
                        }}
                      />
                      <Badge variant={provider.is_active ? "default" : "secondary"}>
                        {provider.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                )) : null}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="llm-models" className="space-y-4">
          <LLMModelsManager />
        </TabsContent>

        <TabsContent value="image-providers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Image Providers</CardTitle>
              <CardDescription>Configure AI image generation providers (Fal.ai, OpenAI DALL-E, etc.)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {imageProviders.map((provider) => (
                  <div key={provider.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{provider.name}</p>
                          <Badge variant={provider.provider_type === 'fal' ? 'default' : 'secondary'}>
                            {provider.provider_type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{provider.base_url}</p>
                        <p className="text-xs text-muted-foreground">Priority: {provider.priority}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={provider.is_active}
                        onCheckedChange={(checked) => {
                          const updated = { ...provider, is_active: checked };
                          updateImageProvider(updated);
                        }}
                      />
                      <Badge variant={provider.is_active ? "default" : "secondary"}>
                        {provider.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="image-models" className="space-y-4">
          <FalModelsManager />
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Prompt Logs</CardTitle>
                  <CardDescription>
                    Real-time system logs and API interactions
                    <br />
                    <span className="text-xs text-muted-foreground">
                      🧹 Auto-cleanup: Every 24h | Keeps last 7 days or max 10,000 logs
                    </span>
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={fetchData}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={clearPromptLogs}
                    disabled={clearingLogs}
                  >
                    {clearingLogs ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    {clearingLogs ? 'Clearing...' : 'Clear All'}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {promptLogs.map((log) => (
                  <div key={log.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {log.success ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <Badge variant="outline">{log.prompt_type}</Badge>
                        <Badge variant="secondary">{log.model_name}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {log.user_email}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{log.tokens_used || 0} tokens</span>
                        <span>${typeof log.cost === 'number' ? log.cost.toFixed(4) : '0.0000'}</span>
                        <span>{log.response_time_ms || 0}ms</span>
                        <span>{new Date(log.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">PROMPT</Label>
                        <div className="mt-1 p-2 bg-muted rounded text-sm max-h-32 overflow-y-auto">
                          {(log.prompt_text || '').substring(0, 200)}
                          {(log.prompt_text || '').length > 200 && '...'}
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">RESPONSE</Label>
                        <div className="mt-1 p-2 bg-muted rounded text-sm max-h-32 overflow-y-auto">
                          {log.success ? (
                            <>
                              {(log.response_text || '').substring(0, 200)}
                              {(log.response_text || '').length > 200 && '...'}
                            </>
                          ) : (
                            <span className="text-red-600">{log.error_message || 'Unknown error'}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {promptLogs.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No logs available. Logs will appear here as users interact with the system.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>View and manage registered users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{user.display_name}</p>
                        <Badge variant={user.subscription_tier === 'admin' ? 'default' : 'secondary'}>
                          {user.subscription_tier}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                        <span>Credits: {user.credits_remaining}</span>
                        <span>Generations: {user.monthly_generations}</span>
                        <span>Joined: {new Date(user.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Provider Dialog */}
      {editingProvider && (
        <Dialog open={!!editingProvider} onOpenChange={() => setEditingProvider(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Provider: {editingProvider.name}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Provider Name</Label>
                <Input
                  value={editingProvider.name}
                  onChange={(e) => setEditingProvider(prev => prev ? { ...prev, name: e.target.value } : null)}
                />
              </div>
              <div>
                <Label>Base URL</Label>
                <Input
                  value={editingProvider.base_url}
                  onChange={(e) => setEditingProvider(prev => prev ? { ...prev, base_url: e.target.value } : null)}
                />
              </div>
              <div>
                <Label>API Key Environment Variable</Label>
                <Input
                  value={editingProvider.api_key_env}
                  onChange={(e) => setEditingProvider(prev => prev ? { ...prev, api_key_env: e.target.value } : null)}
                />
              </div>
              <div>
                <Label>Priority</Label>
                <Input
                  type="number"
                  value={editingProvider.priority}
                  onChange={(e) => setEditingProvider(prev => prev ? { ...prev, priority: parseInt(e.target.value) || 0 } : null)}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setEditingProvider(null)}>
                Cancel
              </Button>
              <Button onClick={() => editingProvider && updateProvider(editingProvider)}>
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Model Dialog */}
      {editingModel && (
        <Dialog open={!!editingModel} onOpenChange={() => setEditingModel(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Model: {editingModel.display_name}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Display Name</Label>
                <Input
                  value={editingModel.display_name}
                  onChange={(e) => setEditingModel(prev => prev ? { ...prev, display_name: e.target.value } : null)}
                />
              </div>
              <div>
                <Label>Model Name</Label>
                <Input
                  value={editingModel.model_name}
                  onChange={(e) => setEditingModel(prev => prev ? { ...prev, model_name: e.target.value } : null)}
                />
              </div>
              <div>
                <Label>Max Tokens</Label>
                <Input
                  type="number"
                  value={editingModel.max_tokens}
                  onChange={(e) => setEditingModel(prev => prev ? { ...prev, max_tokens: parseInt(e.target.value) || 4096 } : null)}
                />
              </div>
              <div>
                <Label>Temperature</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="2"
                  value={editingModel.temperature}
                  onChange={(e) => setEditingModel(prev => prev ? { ...prev, temperature: parseFloat(e.target.value) || 0.7 } : null)}
                />
              </div>
              <div>
                <Label>Cost per 1M Tokens</Label>
                <Input
                  type="number"
                  step="0.0001"
                  value={editingModel.cost_per_1m_tokens}
                  onChange={(e) => setEditingModel(prev => prev ? { ...prev, cost_per_1m_tokens: parseFloat(e.target.value) || 0 } : null)}
                />
              </div>
              <div>
                <Label>Context Window</Label>
                <Input
                  type="number"
                  value={editingModel.context_window}
                  onChange={(e) => setEditingModel(prev => prev ? { ...prev, context_window: parseInt(e.target.value) || 4096 } : null)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={editingModel.supports_functions}
                  onCheckedChange={(checked) => setEditingModel(prev => prev ? { ...prev, supports_functions: checked } : null)}
                />
                <Label>Supports Functions</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={editingModel.supports_vision}
                  onCheckedChange={(checked) => setEditingModel(prev => prev ? { ...prev, supports_vision: checked } : null)}
                />
                <Label>Supports Vision</Label>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setEditingModel(null)}>
                Cancel
              </Button>
              <Button onClick={() => editingModel && updateModel(editingModel)}>
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Image Model Dialog */}
      {editingImageModel && (
        <Dialog open={!!editingImageModel} onOpenChange={() => setEditingImageModel(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Image Model: {editingImageModel.display_name}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Display Name</Label>
                <Input
                  value={editingImageModel.display_name}
                  onChange={(e) => setEditingImageModel(prev => prev ? { ...prev, display_name: e.target.value } : null)}
                />
              </div>
              <div>
                <Label>Model Name</Label>
                <Input
                  value={editingImageModel.model_name}
                  onChange={(e) => setEditingImageModel(prev => prev ? { ...prev, model_name: e.target.value } : null)}
                />
              </div>
              <div>
                <Label>Image Size</Label>
                <Select
                  value={editingImageModel.image_size}
                  onValueChange={(value) => setEditingImageModel(prev => prev ? { ...prev, image_size: value } : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="512x512">512x512</SelectItem>
                    <SelectItem value="768x768">768x768</SelectItem>
                    <SelectItem value="1024x1024">1024x1024</SelectItem>
                    <SelectItem value="1152x896">1152x896</SelectItem>
                    <SelectItem value="896x1152">896x1152</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Quality</Label>
                <Select
                  value={editingImageModel.quality}
                  onValueChange={(value) => setEditingImageModel(prev => prev ? { ...prev, quality: value as any } : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="hd">HD</SelectItem>
                    <SelectItem value="ultra">Ultra</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Style</Label>
                <Input
                  value={editingImageModel.style}
                  onChange={(e) => setEditingImageModel(prev => prev ? { ...prev, style: e.target.value } : null)}
                />
              </div>
              <div>
                <Label>Cost per Image ($)</Label>
                <Input
                  type="number"
                  step="0.001"
                  value={editingImageModel.cost_per_image}
                  onChange={(e) => setEditingImageModel(prev => prev ? { ...prev, cost_per_image: parseFloat(e.target.value) || 0 } : null)}
                />
              </div>
              <div>
                <Label>Max Batch Size</Label>
                <Input
                  type="number"
                  value={editingImageModel.max_batch_size}
                  onChange={(e) => setEditingImageModel(prev => prev ? { ...prev, max_batch_size: parseInt(e.target.value) || 1 } : null)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={editingImageModel.supports_negative_prompt}
                  onCheckedChange={(checked) => setEditingImageModel(prev => prev ? { ...prev, supports_negative_prompt: checked } : null)}
                />
                <Label>Supports Negative Prompt</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={editingImageModel.supports_controlnet}
                  onCheckedChange={(checked) => setEditingImageModel(prev => prev ? { ...prev, supports_controlnet: checked } : null)}
                />
                <Label>Supports ControlNet</Label>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setEditingImageModel(null)}>
                Cancel
              </Button>
              <Button onClick={() => editingImageModel && updateImageModel(editingImageModel)}>
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
      </div>
    </div>
  );
}