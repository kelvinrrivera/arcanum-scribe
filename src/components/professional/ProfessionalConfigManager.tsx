/**
 * Enhanced Configuration Manager - Settings Management Hub
 * 
 * This component provides configuration management features
 * including import/export and settings backup.
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  Download, 
  Upload, 
  RotateCcw, 
  Settings,
  FileText,
  Trash2
} from 'lucide-react';

import type { UseProfessionalModeReturn } from '@/hooks/useProfessionalMode';

interface ProfessionalConfigManagerProps {
  professionalMode: UseProfessionalModeReturn;
  className?: string;
}

export const ProfessionalConfigManager: React.FC<ProfessionalConfigManagerProps> = ({
  professionalMode,
  className = ''
}) => {
  const [importData, setImportData] = useState('');

  // Handle configuration export
  const handleExport = () => {
    try {
      const configData = professionalMode.exportConfiguration();
      
      // Create download link
      const blob = new Blob([configData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `arcanum-scribe-config-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Configuration exported successfully!', {
        description: 'Your settings have been saved to a file',
        duration: 3000
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export configuration');
    }
  };

  // Handle configuration import
  const handleImport = () => {
    if (!importData.trim()) {
      toast.error('Please paste configuration data first');
      return;
    }

    try {
      const success = professionalMode.importConfiguration(importData);
      if (success) {
        setImportData('');
        toast.success('Configuration imported successfully!', {
          description: 'Your settings have been restored',
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Import failed:', error);
      toast.error('Failed to import configuration - invalid data format');
    }
  };

  // Handle configuration reset
  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all enhanced settings? This cannot be undone.')) {
      professionalMode.clearConfiguration();
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Settings className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Configuration Management</CardTitle>
              <CardDescription>
                Manage your enhanced feature settings and preferences
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Management Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Export Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Download className="w-5 h-5 text-primary" />
              <span>Export Settings</span>
            </CardTitle>
            <CardDescription>
              Save your enhanced feature settings to a file for backup or sharing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleExport} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Export Settings
            </Button>
            <div className="mt-3 text-xs text-muted-foreground">
              Exports all enhanced feature settings and preferences
            </div>
          </CardContent>
        </Card>

        {/* Import Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="w-5 h-5 text-primary" />
              <span>Import Settings</span>
            </CardTitle>
            <CardDescription>
              Restore enhanced feature settings from a previously exported file
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              placeholder="Paste your exported configuration data here..."
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              rows={4}
              className="text-xs"
            />
            <Button 
              onClick={handleImport} 
              disabled={!importData.trim()}
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import Settings
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Reset Configuration */}
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-destructive">
            <Trash2 className="w-5 h-5" />
            <span>Reset Settings</span>
          </CardTitle>
          <CardDescription>
            Reset all enhanced feature settings to defaults. This will clear all saved preferences.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="destructive" 
            onClick={handleReset}
            className="w-full"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset All Settings
          </Button>
          <div className="mt-3 text-xs text-destructive">
            ⚠️ This action cannot be undone. Export your settings first if you want to keep them.
          </div>
        </CardContent>
      </Card>

      {/* Information */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2 mb-3">
            <FileText className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium text-foreground">
              About Configuration Management
            </span>
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            <div>• Export your settings to create a backup or share with others</div>
            <div>• Import settings to restore your preferences on different devices</div>
            <div>• Reset to defaults if you want to start fresh</div>
            <div>• All settings are saved automatically as you make changes</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfessionalConfigManager;