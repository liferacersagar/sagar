
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { InputTabs } from './components/InputTabs';
import { AnalysisForm } from './components/AnalysisForm';
import { ResultDisplay } from './components/ResultDisplay';
import { HistoryPanel } from './components/HistoryPanel';
import { Loader } from './components/Loader';
import { analyzeProductLabel, MOCK_BARCODE_LOOKUP } from './services/geminiService';
import { InputMode, AnalysisResult, HistoryItem } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<InputMode>(InputMode.TEXT);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useLocalStorage<HistoryItem[]>('nutriscore_history', []);

  const handleAnalysis = useCallback(async (inputValue: string, inputMode: InputMode, image?: {
    base64: string;
    mimeType: string;
  }) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      let analysisText = inputValue;
      let productName = "Custom Product";

      if (inputMode === InputMode.BARCODE) {
          const lookupResult = MOCK_BARCODE_LOOKUP[inputValue];
          if (!lookupResult) {
              throw new Error(`Barcode ${inputValue} not found. Please try another or enter details manually.`);
          }
          analysisText = lookupResult.label;
          productName = lookupResult.name;
      }
      
      const analysisResult = await analyzeProductLabel(analysisText, image);
      
      if (!analysisResult.productName) {
        analysisResult.productName = productName;
      }

      setResult(analysisResult);
      
      const newHistoryItem: HistoryItem = {
        id: new Date().toISOString(),
        productName: analysisResult.productName || "Untitled Analysis",
        score: analysisResult.healthScore.score,
        band: analysisResult.healthScore.band,
        data: analysisResult,
      };
      setHistory([newHistoryItem, ...history.slice(0, 19)]); // Keep history to 20 items

    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [history, setHistory]);

  const viewHistoryItem = (item: HistoryItem) => {
    setResult(item.data);
    setError(null);
    window.scrollTo(0, 0);
  };
  
  const clearHistory = () => {
    setHistory([]);
    setResult(null);
    setError(null);
  }

  return (
    <div className="min-h-screen bg-brand-dark font-sans text-brand-light">
      <Header />
      <main className="container mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-gray-800/50 rounded-2xl p-6 shadow-2xl backdrop-blur-md border border-gray-700">
            <h2 className="text-2xl font-bold text-brand-primary mb-4">Analyze a Product</h2>
            <InputTabs activeTab={activeTab} setActiveTab={setActiveTab} />
            <AnalysisForm activeTab={activeTab} onAnalyze={handleAnalysis} isLoading={isLoading} />
          </div>

          {isLoading && <Loader />}
          {error && <div className="mt-6 bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg animate-fade-in">{error}</div>}
          {result && !isLoading && <div className="mt-8 animate-fade-in"><ResultDisplay result={result} /></div>}
        </div>
        
        <div className="lg:col-span-1">
           <HistoryPanel history={history} onSelect={viewHistoryItem} onClear={clearHistory} />
        </div>
      </main>
      <footer className="text-center p-4 text-xs text-gray-500">
        <p>NutriScore AI Analyzer. For informational purposes only. Not medical advice.</p>
      </footer>
    </div>
  );
};

export default App;
