/**
 * Adventure Results View with Professional Mode Integration
 * 
 * Enhanced results display that shows quality metrics, professional features,
 * and provides preview functionality for professional content.
 */

import React, { useState } from 'react';
import { QualityMetricsDisplay } from './QualityMetricsDisplay';
import type { ProfessionalEnhancement } from '../../lib/professional-mode-manager';

interface AdventureResultsViewProps {
  adventure: any;
  professionalEnhancement?: ProfessionalEnhancement;
  isProfessionalMode: boolean;
}

export const AdventureResultsView: React.FC<AdventureResultsViewProps> = ({
  adventure,
  professionalEnhancement,
  isProfessionalMode
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'metrics' | 'features'>('content');
  const [showProfessionalPreview, setShowProfessionalPreview] = useState(false);

  const renderContentTab = () => (
    <div className="space-y-6">
      {/* Adventure Title */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {adventure.title || 'Generated Adventure'}
        </h1>
        {isProfessionalMode && professionalEnhancement && (
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full font-medium">
              🦄 {professionalEnhancement.professionalGrade}
            </span>
            <span className="text-sm text-gray-600">
              Unicorn Score: {Math.round(professionalEnhancement.unicornScore)}/100
            </span>
          </div>
        )}
      </div>

      {/* Adventure Content */}
      <div className="prose max-w-none">
        {adventure.introduction && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Introduction</h2>
            <p className="text-gray-700 leading-relaxed">{adventure.introduction}</p>
          </div>
        )}

        {adventure.sections && adventure.sections.map((section: any, index: number) => (
          <div key={index} className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">{section.title}</h2>
            <div className="text-gray-700 leading-relaxed">
              {section.content.split('\n').map((paragraph: string, pIndex: number) => (
                <p key={pIndex} className="mb-3">{paragraph}</p>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Professional Content Preview */}
      {isProfessionalMode && professionalEnhancement && (
        <div className="mt-8 border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Professional Enhancements</h2>
            <button
              onClick={() => setShowProfessionalPreview(!showProfessionalPreview)}
              className="px-4 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
            >
              {showProfessionalPreview ? 'Hide' : 'Show'} Enhanced Features
            </button>
          </div>

          {showProfessionalPreview && (
            <div className="space-y-6">
              {/* Enhanced NPCs */}
              {professionalEnhancement.professionalFeatures.enhancedNPCs && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-3">👥 Enhanced NPCs</h3>
                  <div className="space-y-3">
                    {professionalEnhancement.professionalFeatures.enhancedNPCs.npcs?.map((npc: any, index: number) => (
                      <div key={index} className="bg-white rounded p-3">
                        <h4 className="font-medium text-gray-800">{npc.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{npc.description}</p>
                        <div className="text-xs text-blue-600">
                          Role: {npc.role} | Traits: {npc.personality?.traits?.join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Multi-Solution Puzzles */}
              {professionalEnhancement.professionalFeatures.multiSolutionPuzzles && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 mb-3">🧩 Multi-Solution Puzzles</h3>
                  <div className="space-y-3">
                    {professionalEnhancement.professionalFeatures.multiSolutionPuzzles.puzzles?.map((puzzle: any, index: number) => (
                      <div key={index} className="bg-white rounded p-3">
                        <h4 className="font-medium text-gray-800">{puzzle.type} Puzzle</h4>
                        <p className="text-sm text-gray-600 mb-2">{puzzle.description}</p>
                        <div className="text-xs text-green-600">
                          Solutions: {puzzle.solutions?.length || 0} | Difficulty: {puzzle.difficulty}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tactical Combat */}
              {professionalEnhancement.professionalFeatures.tacticalCombat && (
                <div className="bg-red-50 rounded-lg p-4">
                  <h3 className="font-semibold text-red-800 mb-3">⚔️ Tactical Combat</h3>
                  <div className="space-y-3">
                    {professionalEnhancement.professionalFeatures.tacticalCombat.encounters?.map((encounter: any, index: number) => (
                      <div key={index} className="bg-white rounded p-3">
                        <h4 className="font-medium text-gray-800">{encounter.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{encounter.description}</p>
                        <div className="text-xs text-red-600">
                          Difficulty: {encounter.difficulty} | Tactical Elements: {encounter.tacticalElements?.length || 0}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Professional Layout */}
              {professionalEnhancement.professionalFeatures.professionalLayout && (
                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-800 mb-3">📐 Professional Layout</h3>
                  <div className="bg-white rounded p-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Page Count:</span> {professionalEnhancement.professionalFeatures.professionalLayout.pageCount}
                      </div>
                      <div>
                        <span className="font-medium">Word Count:</span> {professionalEnhancement.professionalFeatures.professionalLayout.wordCount}
                      </div>
                      <div>
                        <span className="font-medium">Readability:</span> {Math.round(professionalEnhancement.professionalFeatures.professionalLayout.readabilityScore)}/100
                      </div>
                      <div>
                        <span className="font-medium">Grade:</span> {professionalEnhancement.professionalFeatures.professionalLayout.professionalGrade}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderMetricsTab = () => (
    <div className="space-y-6">
      {isProfessionalMode && professionalEnhancement ? (
        <>
          <QualityMetricsDisplay metrics={professionalEnhancement.qualityMetrics} />
          
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Enhancement Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded p-4">
                <h4 className="font-medium text-gray-800 mb-2">Processing Time</h4>
                <p className="text-2xl font-bold text-purple-600">{professionalEnhancement.processingTime}ms</p>
              </div>
              <div className="bg-white rounded p-4">
                <h4 className="font-medium text-gray-800 mb-2">Features Applied</h4>
                <p className="text-2xl font-bold text-green-600">{professionalEnhancement.featuresApplied.length}</p>
              </div>
              <div className="bg-white rounded p-4">
                <h4 className="font-medium text-gray-800 mb-2">Professional Grade</h4>
                <p className="text-lg font-bold text-blue-600">{professionalEnhancement.professionalGrade}</p>
              </div>
              <div className="bg-white rounded p-4">
                <h4 className="font-medium text-gray-800 mb-2">Unicorn Score</h4>
                <p className="text-2xl font-bold text-purple-600">{Math.round(professionalEnhancement.unicornScore)}/100</p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No Quality Metrics Available</h3>
          <p className="text-gray-600">Enable Professional Mode to see detailed quality metrics and analysis.</p>
        </div>
      )}
    </div>
  );

  const renderFeaturesTab = () => (
    <div className="space-y-6">
      {isProfessionalMode && professionalEnhancement ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Applied Professional Features</h3>
          
          {professionalEnhancement.featuresApplied.map((featureName, index) => {
            const featureData = professionalEnhancement.professionalFeatures[featureName];
            
            return (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-800 capitalize">
                    {featureName.replace(/([A-Z])/g, ' $1').trim()}
                  </h4>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                    ✅ Applied
                  </span>
                </div>
                
                {featureData && (
                  <div className="text-sm text-gray-600">
                    <pre className="bg-gray-50 rounded p-2 overflow-x-auto">
                      {JSON.stringify(featureData, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No Professional Features Applied</h3>
          <p className="text-gray-600">Enable Professional Mode to see detailed feature information and enhancements.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'content', label: 'Adventure Content', icon: '📖' },
            { id: 'metrics', label: 'Quality Metrics', icon: '📊' },
            { id: 'features', label: 'Professional Features', icon: '🦄' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'content' && renderContentTab()}
        {activeTab === 'metrics' && renderMetricsTab()}
        {activeTab === 'features' && renderFeaturesTab()}
      </div>
    </div>
  );
};