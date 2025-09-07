import React, { useState } from 'react';
import { AnalysisResult } from '../types';
import { ChevronDownIcon, CheckCircleIcon, XCircleIcon, InfoIcon, DocumentTextIcon, LinkIcon, BeakerIcon, SparklesIcon } from './icons';
import { NutrientChart } from './NutrientChart';

interface ResultDisplayProps {
  result: AnalysisResult;
}

const getScoreColor = (band: string): string => {
  switch (band) {
    case 'Excellent': return 'text-green-400';
    case 'Good': return 'text-lime-400';
    case 'Fair': return 'text-yellow-400';
    case 'Poor': return 'text-orange-400';
    case 'Very Poor': return 'text-red-500';
    default: return 'text-gray-400';
  }
};

const getScoreBgColor = (band: string): string => {
    switch (band) {
      case 'Excellent': return 'bg-green-500/10 border-green-500/30';
      case 'Good': return 'bg-lime-500/10 border-lime-500/30';
      case 'Fair': return 'bg-yellow-500/10 border-yellow-500/30';
      case 'Poor': return 'bg-orange-500/10 border-orange-500/30';
      case 'Very Poor': return 'bg-red-500/10 border-red-500/30';
      default: return 'bg-gray-500/10 border-gray-500/30';
    }
  };

const CollapsibleSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, icon, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="bg-gray-800/50 rounded-lg border border-gray-700">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-4 text-left">
                <div className="flex items-center">
                    {icon}
                    <h3 className="ml-3 text-lg font-medium text-gray-200">{title}</h3>
                </div>
                <ChevronDownIcon className={`w-5 h-5 text-gray-400 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && <div className="p-4 border-t border-gray-700 animate-fade-in">{children}</div>}
        </div>
    );
};


export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result }) => {
  const { productName, healthScore, normalizedData, missingInfo, evidencePanel, healthSuggestions } = result;
  
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-center text-white">{productName}</h2>
      
      {/* Score */}
      <div className={`p-6 rounded-2xl border ${getScoreBgColor(healthScore.band)} flex flex-col items-center justify-center shadow-lg`}>
        <div className="text-sm text-gray-300 mb-2">Health Score</div>
        <div className={`text-7xl font-bold ${getScoreColor(healthScore.band)}`}>{healthScore.score}</div>
        <div className={`text-xl font-semibold mt-2 ${getScoreColor(healthScore.band)}`}>{healthScore.band}</div>
      </div>
      
      {/* Drivers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {healthScore.drivers.filter(d => d.type === 'positive').length > 0 && (
            <div className="bg-green-900/40 p-4 rounded-lg border border-green-800">
                <h3 className="font-semibold text-green-300 mb-2 flex items-center"><CheckCircleIcon className="w-5 h-5 mr-2"/>Positive Drivers</h3>
                <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                    {healthScore.drivers.filter(d => d.type === 'positive').map((driver, i) => <li key={i}>{driver.explanation}</li>)}
                </ul>
            </div>
        )}
        {healthScore.drivers.filter(d => d.type === 'negative').length > 0 && (
            <div className="bg-red-900/40 p-4 rounded-lg border border-red-800">
                <h3 className="font-semibold text-red-300 mb-2 flex items-center"><XCircleIcon className="w-5 h-5 mr-2"/>Negative Drivers</h3>
                <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                    {healthScore.drivers.filter(d => d.type === 'negative').map((driver, i) => <li key={i}>{driver.explanation}</li>)}
                </ul>
            </div>
        )}
      </div>

      {/* Collapsible Sections */}
       <div className="space-y-4">
        
        <CollapsibleSection title="Healthier Alternatives" icon={<SparklesIcon className="w-5 h-5 text-brand-accent" />} defaultOpen={true}>
            <div className="space-y-4">
                {healthSuggestions && healthSuggestions.length > 0 ? (
                    healthSuggestions.map((suggestion, index) => (
                    <div key={index} className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                        <h4 className="font-semibold text-brand-secondary">{suggestion.title}</h4>
                        <p className="text-sm text-gray-300 mt-1">{suggestion.description}</p>
                    </div>
                ))
                ) : (
                    <p className="text-sm text-gray-400">No specific suggestions were generated for this product.</p>
                )}
            </div>
        </CollapsibleSection>

        {missingInfo.length > 0 && (
            <CollapsibleSection title="Missing Information" icon={<InfoIcon className="w-5 h-5 text-yellow-400" />}>
                <p className="text-sm text-gray-400 mb-2">The AI noted some missing information. Providing these details could improve accuracy:</p>
                <ul className="list-disc list-inside text-yellow-300 text-sm space-y-1">
                    {missingInfo.map((info, i) => <li key={i}>{info}</li>)}
                </ul>
            </CollapsibleSection>
        )}

        <CollapsibleSection title="Normalized Data" icon={<DocumentTextIcon className="w-5 h-5 text-blue-400" />}>
            <div className="text-sm text-gray-300 space-y-4">
                <p><strong>Serving Size:</strong> {normalizedData.servingSize}</p>
                <p><strong>Calories:</strong> {normalizedData.calories}</p>
                <div>
                    <strong>Ingredients:</strong>
                    <p className="text-gray-400 italic text-xs mt-1">{normalizedData.ingredients.join(', ')}</p>
                </div>
                <div>
                    <strong>Nutrients:</strong>
                    <ul className="mt-2 space-y-1">
                        {normalizedData.nutrients.map((n, i) => (
                            <li key={i} className="flex justify-between border-b border-gray-700/50 py-1">
                                <span>{n.name}</span>
                                <span className="text-gray-400">{n.amount} {n.dailyValue && `(${n.dailyValue})`}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="pt-4">
                     <NutrientChart nutrients={normalizedData.nutrients} />
                </div>
            </div>
        </CollapsibleSection>
        
        <CollapsibleSection title="Evidence Panel" icon={<BeakerIcon className="w-5 h-5 text-purple-400" />}>
            <div className="text-sm text-gray-300 space-y-4">
                <div>
                    <h4 className="font-semibold text-gray-200 mb-2">Rules & Thresholds</h4>
                    <ul className="space-y-2">
                        {evidencePanel.rules.map((rule, i) => (
                            <li key={i} className="flex items-start">
                                {rule.status === 'fired' && <XCircleIcon className="w-4 h-4 text-red-400 mt-0.5 mr-2 flex-shrink-0" />}
                                {rule.status === 'not_fired' && <CheckCircleIcon className="w-4 h-4 text-green-400 mt-0.5 mr-2 flex-shrink-0" />}
                                {rule.status === 'not_applicable' && <InfoIcon className="w-4 h-4 text-gray-500 mt-0.5 mr-2 flex-shrink-0" />}
                                <span><span className="font-medium">{rule.rule}:</span> <span className="text-gray-400"> (Found: {rule.value})</span></span>
                            </li>
                        ))}
                    </ul>
                </div>
                 <div>
                    <h4 className="font-semibold text-gray-200 mb-2">Sources</h4>
                    <ul className="space-y-1">
                        {evidencePanel.sources.map((source, i) => (
                            <li key={i} className="flex items-center">
                                <LinkIcon className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
                                {source.url ? (
                                    <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{source.name}</a>
                                ): (
                                    <span>{source.name}</span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </CollapsibleSection>
       </div>
    </div>
  );
};