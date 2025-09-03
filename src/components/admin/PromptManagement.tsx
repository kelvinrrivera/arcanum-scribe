import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Eye, Edit, Activity, BarChart3 } from 'lucide-react';

interface PromptTemplate {
  id: string;
  name: string;
  type: 'adventure' | 'image_monster' | 'image_scene' | 'image_npc' | 'image_item';
  template: string;
  variables: string[];
  is_active: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}

interface APILog {
  id: string;
  provider: string;
  model: string;
  request_type: 'llm' | 'image';
  prompt: string;
  system_prompt?: string;
  response: string;
  tokens_used?: number;
  cost: number;
  duration_ms: number;
  success: boolean;
  error_message?: string;
  user_id: string;
  created_at: string;
}

const PromptManagement: React.FC = () => {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [apiLogs, setApiLogs] = useState<APILog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTemplate, setEditedTemplate] = useState('');

  // Component state tracking for development
  if (process.env.NODE_ENV === 'development') {
    console.log('PromptManagement component rendered', { 
      templates: templates.length, 
      apiLogs: apiLogs.length, 
      loading, 
      error: !!error,
      analysis: !!analysis 
    });
  }

  const loadTemplates = async () => {
    try {
      // Try multiple token sources (including auth_token used by useAuth)
      let token = localStorage.getItem('auth_token') ||
                  localStorage.getItem('token') || 
                  localStorage.getItem('access_token') || 
                  sessionStorage.getItem('token') ||
                  sessionStorage.getItem('access_token');
      
      if (!token) {
        console.log('🔍 Available localStorage keys:', Object.keys(localStorage));
        console.log('🔍 Available sessionStorage keys:', Object.keys(sessionStorage));
        setError('No authentication token found. Please log in again.');
        return;
      }

      const response = await fetch('/api/admin/prompt-templates', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
        if (process.env.NODE_ENV === 'development') {
          console.log('Templates loaded:', data.length);
        }
      } else {
        const errorData = await response.text();
        console.error('❌ Failed to load templates:', response.status, errorData);
        setError(`Failed to load templates: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Error loading templates:', error);
      setError('Failed to load prompt templates');
    }
  };

  const loadAPILogs = async () => {
    try {
      let token = localStorage.getItem('auth_token') ||
                  localStorage.getItem('token') || 
                  localStorage.getItem('access_token') || 
                  sessionStorage.getItem('token') ||
                  sessionStorage.getItem('access_token');
      if (!token) return;

      console.log('📊 Loading API logs...');
      const response = await fetch('/api/admin/api-logs?limit=100', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setApiLogs(data.logs || []);
        console.log('✅ API logs loaded:', data.logs?.length || 0);
      } else {
        console.error('❌ Failed to load API logs:', response.status);
      }
    } catch (error) {
      console.error('❌ Error loading API logs:', error);
    }
  };

  const loadAnalysis = async () => {
    try {
      let token = localStorage.getItem('auth_token') ||
                  localStorage.getItem('token') || 
                  localStorage.getItem('access_token') || 
                  sessionStorage.getItem('token') ||
                  sessionStorage.getItem('access_token');
      if (!token) return;

      console.log('📈 Loading analysis...');
      const response = await fetch('/api/admin/prompt-analysis', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalysis(data);
        console.log('✅ Analysis loaded:', data);
      } else {
        console.error('❌ Failed to load analysis:', response.status);
      }
    } catch (error) {
      console.error('❌ Error loading analysis:', error);
    }
  };

  const saveTemplate = async () => {
    if (!selectedTemplate) return;
    
    try {
      const token = localStorage.getItem('auth_token') ||
                    localStorage.getItem('token') || 
                    localStorage.getItem('access_token');
      
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await fetch(`/api/admin/prompt-templates/${selectedTemplate.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...selectedTemplate,
          template: editedTemplate
        })
      });

      if (response.ok) {
        await loadTemplates(); // Reload templates
        setIsEditing(false);
        setSelectedTemplate(null);
        setEditedTemplate('');
      } else {
        const errorData = await response.text();
        console.error('❌ Failed to update template:', errorData);
        setError(`Failed to update template: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Error updating template:', error);
      setError('Failed to update template');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      console.log('🔄 Starting to load data...');
      setLoading(true);
      try {
        await Promise.all([
          loadTemplates(),
          loadAPILogs(),
          loadAnalysis()
        ]);
        console.log('✅ All data loaded successfully');
      } catch (error) {
        console.error('❌ Error loading data:', error);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (selectedTemplate && isEditing) {
      setEditedTemplate(selectedTemplate.template);
    }
  }, [selectedTemplate, isEditing]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading prompt management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">🔧 Prompt Management System</h2>
          <p className="text-sm text-gray-600 mt-1">
            Control and optimize all AI prompts for better content quality
          </p>
          <div className="mt-2 p-2 bg-green-100 border border-green-300 rounded text-green-800 text-sm">
            ✅ NEW VERSION LOADED - Modals and editing should work now! (v2.0)
          </div>
        </div>
        <Button onClick={() => alert('Template creation functionality will be implemented in the next version.\n\nFor now, you can:\n• View existing templates\n• Analyze prompt performance\n• Monitor API usage\n• Identify optimization opportunities')}>
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </Button>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">
            {error}
            {error.includes('authentication') && (
              <div className="mt-2">
                <p className="font-medium">🔧 How to fix:</p>
                <ol className="list-decimal list-inside text-sm mt-1">
                  <li>Log out and log back in</li>
                  <li>Make sure you're using an admin account</li>
                  <li>Check browser console for more details</li>
                </ol>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Quality Issues Alert */}
      {analysis && analysis.truncation_risk && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertDescription className="text-orange-800">
            <div className="flex items-start gap-2">
              <span className="text-lg">⚠️</span>
              <div>
                <p className="font-medium">Quality Issue Detected!</p>
                <p className="text-sm mt-1">
                  Your image prompts are too long ({analysis.image_prompts_avg_length} chars average) and may be getting truncated by AI models, 
                  causing the poor image quality you experienced. Image models typically truncate prompts around 400 characters.
                </p>
                <p className="text-sm mt-2 font-medium">
                  💡 Solution: Edit the image prompts below to make them shorter and more focused.
                </p>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        {/* Templates Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📋 Prompt Templates ({templates.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {templates.length === 0 ? (
              <p className="text-gray-500">No templates found</p>
            ) : (
              <div className="space-y-4">
                {templates.map((template) => (
                  <div key={template.id} className="border rounded p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{template.name}</h3>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline">{template.type}</Badge>
                          <Badge variant={template.is_active ? "default" : "secondary"}>
                            {template.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          Variables: {template.variables.join(', ')} | 
                          Length: {template.template.length} chars | 
                          Version: {template.version}
                        </p>
                        {template.template.length > 400 && template.type.startsWith('image_') && (
                          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                            <p className="text-xs text-yellow-800">
                              ⚠️ This prompt is {template.template.length} characters long and may be truncated by image models (recommended: &lt;400 chars)
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedTemplate(template)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedTemplate(template);
                            setIsEditing(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* API Logs Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent API Calls ({apiLogs.length})
              </div>
              <div className="flex gap-2 text-sm">
                <span className="text-green-600">
                  ✅ {apiLogs.filter(log => log.success).length} Success
                </span>
                <span className="text-red-600">
                  ❌ {apiLogs.filter(log => !log.success).length} Failed
                </span>
                <span className="text-blue-600">
                  💰 ${apiLogs.reduce((sum, log) => sum + (typeof log.cost === 'string' ? parseFloat(log.cost) : log.cost), 0).toFixed(4)} Total
                </span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {apiLogs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-2">No API logs found</p>
                <p className="text-sm text-gray-400">Generate some content to see API calls here</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {apiLogs.map((log) => (
                  <div key={log.id} className="border rounded p-3 text-sm hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={log.success ? "default" : "destructive"}>
                          {log.success ? 'Success' : 'Failed'}
                        </Badge>
                        <Badge variant="outline">{log.provider}</Badge>
                        <Badge variant="outline">{log.model}</Badge>
                        <Badge variant="outline">{log.request_type.toUpperCase()}</Badge>
                      </div>
                      <div className="text-gray-500 text-xs">
                        {new Date(log.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-xs text-gray-700">
                      <div>
                        <span className="font-medium">Duration:</span> {log.duration_ms}ms
                      </div>
                      <div>
                        <span className="font-medium">Cost:</span> ${typeof log.cost === 'string' ? parseFloat(log.cost).toFixed(4) : log.cost.toFixed(4)}
                      </div>
                      <div>
                        <span className="font-medium">Prompt:</span> {log.prompt.length} chars
                        {log.prompt.length > 400 && log.request_type === 'image' && (
                          <span className="text-orange-600 ml-1">⚠️</span>
                        )}
                      </div>
                    </div>
                    {log.error_message && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-xs">
                        <span className="font-medium">Error:</span> {log.error_message}
                      </div>
                    )}
                    <div className="mt-2 flex gap-2">
                      <button 
                        onClick={() => {
                          alert(`Full Prompt (${log.prompt.length} chars):\n\n${log.prompt}`);
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        View Prompt
                      </button>
                      {log.response && (
                        <button 
                          onClick={() => {
                            alert(`Response:\n\n${log.response.substring(0, 500)}${log.response.length > 500 ? '...' : ''}`);
                          }}
                          className="text-xs text-green-600 hover:text-green-800"
                        >
                          View Response
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analysis Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Prompt Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analysis ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded">
                    <h4 className="font-medium">Adventure Prompt Length</h4>
                    <p className="text-2xl font-bold">{analysis.adventure_prompt_length}</p>
                    <p className="text-sm text-gray-600">characters</p>
                  </div>
                  <div className="p-4 border rounded">
                    <h4 className="font-medium">Avg Image Prompt Length</h4>
                    <p className="text-2xl font-bold">{analysis.image_prompts_avg_length}</p>
                    <p className="text-sm text-gray-600">characters</p>
                  </div>
                </div>
                
                {analysis.truncation_risk && (
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertDescription className="text-yellow-800">
                      ⚠️ Image prompts may be at risk of truncation by image models
                    </AlertDescription>
                  </Alert>
                )}

                {analysis.recommendations && analysis.recommendations.length > 0 && (
                  <div className="p-4 border rounded bg-blue-50">
                    <h4 className="font-medium mb-2 text-blue-800">🎯 Action Items to Improve Quality</h4>
                    <ul className="space-y-2">
                      {analysis.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="text-sm text-blue-700 flex items-start gap-2">
                          <span className="text-blue-500 mt-0.5">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 p-3 bg-blue-100 rounded text-sm text-blue-800">
                      <p className="font-medium">💡 Quick Fix:</p>
                      <p>Focus on shortening image prompts to under 400 characters while keeping the essential details. This will prevent truncation and improve image quality significantly.</p>
                    </div>
                    
                    <div className="mt-3 flex gap-2">
                      <button 
                        onClick={() => {
                          const longTemplates = templates.filter(t => 
                            t.type.startsWith('image_') && t.template.length > 400
                          );
                          if (longTemplates.length > 0) {
                            setSelectedTemplate(longTemplates[0]);
                            setIsEditing(true);
                          }
                        }}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        🔧 Fix First Long Prompt
                      </button>
                      <button 
                        onClick={() => {
                          const problemPrompts = templates.filter(t => 
                            t.type.startsWith('image_') && t.template.length > 400
                          ).map(t => `• ${t.name}: ${t.template.length} chars`).join('\n');
                          
                          alert(`🔍 Prompts that need optimization:\n\n${problemPrompts}\n\nClick on any template above to edit it.`);
                        }}
                        className="px-3 py-1 border border-blue-600 text-blue-600 rounded text-sm hover:bg-blue-50"
                      >
                        📋 Show All Problem Prompts
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">Loading analysis...</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Template View Modal */}
      {selectedTemplate && !isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-y-auto w-full mx-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedTemplate.name}</h3>
                <div className="flex gap-2 mt-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                    {selectedTemplate.type}
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                    {selectedTemplate.template.length} characters
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedTemplate(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Variables:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.variables.map((variable) => (
                    <span key={variable} className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm">
                      {variable}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Template Content:</h4>
                <div className="bg-gray-50 border rounded p-4 max-h-96 overflow-y-auto">
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                    {selectedTemplate.template}
                  </pre>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button 
                onClick={() => setSelectedTemplate(null)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-gray-700"
              >
                Close
              </button>
              <button 
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Edit Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template Edit Modal */}
      {selectedTemplate && isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-6xl max-h-[95vh] overflow-y-auto w-full mx-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Edit: {selectedTemplate.name}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Current length: {editedTemplate.length} characters
                  {editedTemplate.length > 400 && selectedTemplate.type.startsWith('image_') && (
                    <span className="text-orange-600 ml-2">⚠️ May be truncated by image models</span>
                  )}
                </p>
              </div>
              <button 
                onClick={() => {
                  setIsEditing(false);
                  setSelectedTemplate(null);
                  setEditedTemplate('');
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Template Content:
                </label>
                <textarea
                  value={editedTemplate}
                  onChange={(e) => setEditedTemplate(e.target.value)}
                  className="w-full h-96 p-4 border border-gray-300 rounded font-mono text-sm text-gray-900 bg-white"
                  placeholder="Enter your prompt template here..."
                />
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded p-4">
                <h4 className="font-medium text-blue-900 mb-2">💡 Optimization Tips:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Keep image prompts under 400 characters to avoid truncation</li>
                  <li>• Focus on essential details only</li>
                  <li>• Use variables like {'{'}theme{'}'} and {'{'}tone{'}'} for context</li>
                  <li>• Test changes by generating new content</li>
                </ul>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button 
                onClick={() => {
                  setIsEditing(false);
                  setEditedTemplate('');
                }}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-gray-700"
              >
                Cancel
              </button>
              <button 
                onClick={saveTemplate}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptManagement;