import React, { useState, useEffect } from 'react';

interface FalModel {
  id: string;
  model_id: string;
  display_name: string;
  pricing_per_megapixel: number;
  pricing_unit: string;
  max_resolution: string;
  supports_img2img: boolean;
  supports_inpainting: boolean;
  supports_outpainting: boolean;
  is_active: boolean;
  priority: number;
  description: string;
}

interface AdminImageConfig {
  id: string;
  default_model_id: string;
  default_resolution: string;
  max_images_per_adventure: number;
  enable_img2img: boolean;
  enable_inpainting: boolean;
  enable_outpainting: boolean;
  pricing_multiplier: number;
}

export default function FalModelsManager() {
  const [models, setModels] = useState<FalModel[]>([]);
  const [config, setConfig] = useState<AdminImageConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; image_url?: string; error?: string }>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      // Fetch Fal.ai models
      const modelsResponse = await fetch('/api/admin/fal-models', { headers });
      if (!modelsResponse.ok) throw new Error('Failed to fetch Fal.ai models');
      const modelsData = await modelsResponse.json();
      setModels(modelsData.models || []);

      // Fetch admin image configuration
      const configResponse = await fetch('/api/admin/image-config', { headers });
      if (!configResponse.ok) throw new Error('Failed to fetch image config');
      const configData = await configResponse.json();
      setConfig(configData.config || null);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const updateModelStatus = async (modelId: string, isActive: boolean) => {
    try {
      setSaving(true);
      
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setError('Authentication required');
        setSaving(false);
        return;
      }

      const response = await fetch(`/api/admin/fal-models/${modelId}`, {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update model');
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = async (newConfig: Partial<AdminImageConfig>) => {
    try {
      setSaving(true);
      
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setError('Authentication required');
        setSaving(false);
        return;
      }

      const response = await fetch('/api/admin/image-config', {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(newConfig)
      });

      if (!response.ok) throw new Error('Failed to update configuration');
      
      const updatedConfig = await response.json();
      setConfig(updatedConfig.config);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update configuration');
    } finally {
      setSaving(false);
    }
  };

  const calculateMegapixels = (resolution: string): number => {
    const [width, height] = resolution.split('x').map(Number);
    return (width * height) / 1000000;
  };

  const formatPrice = (pricePerMP: number, resolution: string): string => {
    const mp = calculateMegapixels(resolution);
    const totalPrice = pricePerMP * mp;
    return `$${totalPrice.toFixed(4)}`;
  };

  const testModel = async (model: FalModel) => {
    setTesting(model.id);
    
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setError('Authentication required');
        setTesting(null);
        return;
      }

      const response = await fetch('/api/admin/test-fal-model', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
          model_id: model.model_id
        })
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        setTestResults(prev => ({
          ...prev,
          [model.id]: { 
            success: true, 
            image_url: result.image_url 
          }
        }));
        setError(null);
      } else {
        setTestResults(prev => ({
          ...prev,
          [model.id]: { 
            success: false, 
            error: result.error || 'Test failed' 
          }
        }));
        setError(`${model.display_name} test failed: ${result.error}`);
      }
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [model.id]: { 
          success: false, 
          error: error.message 
        }
      }));
      setError(`Test failed: ${error.message}`);
    } finally {
      setTesting(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Configuration Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🎨 Image Generation Configuration
        </h3>
        
        {config && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Model
              </label>
              <select
                value={config.default_model_id}
                onChange={(e) => updateConfig({ default_model_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={saving}
              >
                {models.filter(m => m.is_active).map(model => (
                  <option key={model.id} value={model.model_id}>
                    {model.display_name} (${model.pricing_per_megapixel}/MP)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Resolution
              </label>
              <select
                value={config.default_resolution}
                onChange={(e) => updateConfig({ default_resolution: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={saving}
              >
                <option value="512x512">512x512 (0.26 MP)</option>
                <option value="768x768">768x768 (0.59 MP)</option>
                <option value="1024x1024">1024x1024 (1.05 MP)</option>
                <option value="1536x1536">1536x1536 (2.36 MP)</option>
                <option value="2048x2048">2048x2048 (4.19 MP)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Images per Adventure
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={config.max_images_per_adventure}
                onChange={(e) => updateConfig({ max_images_per_adventure: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pricing Multiplier
              </label>
              <input
                type="number"
                min="0.1"
                max="5.0"
                step="0.1"
                value={config.pricing_multiplier}
                onChange={(e) => updateConfig({ pricing_multiplier: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={saving}
              />
            </div>
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config?.enable_img2img || false}
              onChange={(e) => updateConfig({ enable_img2img: e.target.checked })}
              className="mr-2"
              disabled={saving}
            />
            <span className="text-sm text-gray-700">Enable Image-to-Image</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config?.enable_inpainting || false}
              onChange={(e) => updateConfig({ enable_inpainting: e.target.checked })}
              className="mr-2"
              disabled={saving}
            />
            <span className="text-sm text-gray-700">Enable Inpainting</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config?.enable_outpainting || false}
              onChange={(e) => updateConfig({ enable_outpainting: e.target.checked })}
              className="mr-2"
              disabled={saving}
            />
            <span className="text-sm text-gray-700">Enable Outpainting</span>
          </label>
        </div>
      </div>

      {/* Models Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🖼️ Fal.ai Image Models
        </h3>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {models.map((model) => (
            <div
              key={model.id}
              className={`p-4 border rounded-lg ${
                model.is_active ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h4 className="font-medium text-gray-900">{model.display_name}</h4>
                    <span className="text-sm text-gray-500">({model.model_id})</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      model.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {model.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-1">{model.description}</p>
                  
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span>💰 ${model.pricing_per_megapixel}/MP</span>
                    <span>📐 {model.max_resolution}</span>
                    <span>💵 {formatPrice(model.pricing_per_megapixel, model.max_resolution)} per image</span>
                  </div>

                  <div className="flex items-center space-x-2 mt-2">
                    {model.supports_img2img && (
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">img2img</span>
                    )}
                    {model.supports_inpainting && (
                      <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">inpainting</span>
                    )}
                    {model.supports_outpainting && (
                      <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded">outpainting</span>
                    )}
                  </div>

                  {/* Test Results */}
                  {testResults[model.id] && (
                    <div className={`mt-3 p-3 rounded-lg ${
                      testResults[model.id].success 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-red-50 border border-red-200'
                    }`}>
                      {testResults[model.id].success ? (
                        <div>
                          <div className="flex items-center gap-2 text-green-800 mb-2">
                            <span className="text-sm font-medium">✅ Test Successful</span>
                          </div>
                          {testResults[model.id].image_url && (
                            <div className="mt-2">
                              <img 
                                src={testResults[model.id].image_url} 
                                alt="Test result" 
                                className="w-24 h-24 object-cover rounded border"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                              <p className="text-xs text-green-600 mt-1">Generated test image</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-red-800">
                          <span className="text-sm font-medium">❌ Test Failed:</span>
                          <span className="text-sm">{testResults[model.id].error}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => testModel(model)}
                    disabled={!model.is_active || testing === model.id}
                    className={`px-3 py-1 text-sm rounded-md transition-colors flex items-center gap-1 ${
                      model.is_active
                        ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    } ${testing === model.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {testing === model.id ? (
                      <>
                        <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        Testing
                      </>
                    ) : (
                      <>
                        🧪 Test
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => updateModelStatus(model.id, !model.is_active)}
                    disabled={saving}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      model.is_active
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {model.is_active ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {models.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No Fal.ai models found. Run the update script to add models.</p>
          </div>
        )}
      </div>
    </div>
  );
}